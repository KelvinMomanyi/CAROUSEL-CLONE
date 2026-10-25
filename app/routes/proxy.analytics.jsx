import { authenticate } from "../shopify.server";
import prisma from "../db.server";
import { normalizeAnalyticsEvent, readAnalyticsBody } from "../utils/analytics-ingestion.server";

const rateLimits = new Map();

function isRateLimited(shop) {
  const now = Date.now();
  if (rateLimits.size >= 10000) {
    for (const [key, value] of rateLimits) {
      if (now - value.startedAt > 60000) rateLimits.delete(key);
    }
    // This is only a per-instance burst guard, never a fleet-wide quota limit.
    if (rateLimits.size >= 10000 && !rateLimits.has(shop)) return true;
  }
  const entry = rateLimits.get(shop);
  if (!entry || now - entry.startedAt > 60000) {
    rateLimits.set(shop, { startedAt: now, count: 1 });
    return false;
  }
  entry.count += 1;
  return entry.count > 200;
}

export const action = async ({ request }) => {
  if (request.method !== "POST") {
    return Response.json({ error: "Method not allowed" }, { status: 405 });
  }

  try {
    const body = await readAnalyticsBody(request);
    if (!Array.isArray(body?.events) || body.events.length === 0 || body.events.length > 50) {
      return Response.json({ error: "Expected 1 to 50 events" }, { status: 400 });
    }
    const { session } = await authenticate.public.appProxy(request);
    if (!session?.shop) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (isRateLimited(session.shop)) {
      return Response.json({ error: "Rate limited" }, { status: 429 });
    }

    const events = body.events
      .map((event) => normalizeAnalyticsEvent(event, session.shop))
      .filter(Boolean);
    if (!events.length) {
      return Response.json({ error: "No valid events" }, { status: 400 });
    }

    const result = await prisma.carouselEvent.createMany({ data: events, skipDuplicates: true });
    return Response.json({ ok: true, count: result.count });
  } catch (error) {
    if (error instanceof Response) return error;
    console.error("[Analytics] Event ingestion failed:", error);
    return Response.json({ error: "Internal error" }, { status: 500 });
  }
};

export const loader = async () =>
  Response.json({ error: "Use POST" }, { status: 405 });
