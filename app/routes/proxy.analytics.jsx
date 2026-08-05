import { authenticate } from "../shopify.server";
import prisma from "../db.server";

const EVENT_TYPES = new Set(["impression", "click", "add_to_cart"]);
const rateLimits = new Map();

function isRateLimited(shop) {
  const now = Date.now();
  const entry = rateLimits.get(shop);
  if (!entry || now - entry.startedAt > 60000) {
    rateLimits.set(shop, { startedAt: now, count: 1 });
    return false;
  }
  entry.count += 1;
  return entry.count > 200;
}

function clean(value, limit) {
  if (typeof value !== "string") return null;
  return value.slice(0, limit).replace(/[^\w\-/.:?&#= ]/g, "");
}

function validateEvent(event) {
  if (!event || !EVENT_TYPES.has(event.type)) return null;
  return {
    blockName: clean(event.blockName, 64) || "unknown",
    eventType: event.type,
    productId: clean(event.productId, 128),
    variantId: clean(event.variantId, 128),
    pageUrl: clean(event.pageUrl, 512),
  };
}

export const action = async ({ request }) => {
  if (request.method !== "POST") {
    return Response.json({ error: "Method not allowed" }, { status: 405 });
  }

  try {
    const { session } = await authenticate.public.appProxy(request);
    if (!session?.shop) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (isRateLimited(session.shop)) {
      return Response.json({ error: "Rate limited" }, { status: 429 });
    }

    const body = await request.json().catch(() => null);
    if (!Array.isArray(body?.events) || body.events.length === 0) {
      return Response.json({ error: "No events provided" }, { status: 400 });
    }

    const events = body.events
      .slice(0, 50)
      .map(validateEvent)
      .filter(Boolean)
      .map((event) => ({ id: crypto.randomUUID(), shop: session.shop, ...event }));
    if (!events.length) {
      return Response.json({ error: "No valid events" }, { status: 400 });
    }

    await prisma.carouselEvent.createMany({ data: events, skipDuplicates: true });
    return Response.json({ ok: true, count: events.length });
  } catch (error) {
    console.error("[Analytics] Event ingestion failed:", error);
    return Response.json({ error: "Internal error" }, { status: 500 });
  }
};

export const loader = async () =>
  Response.json({ error: "Use POST" }, { status: 405 });
