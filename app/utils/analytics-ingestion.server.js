export const MAX_ANALYTICS_BYTES = 64 * 1024;
const EVENT_TYPES = new Set(["impression", "click", "add_to_cart"]);
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function readAnalyticsBody(request) {
  if (Number(request.headers.get("content-length")) > MAX_ANALYTICS_BYTES) {
    throw new Response("Payload too large", { status: 413 });
  }
  const reader = request.body?.getReader();
  if (!reader) return null;
  const decoder = new TextDecoder();
  let size = 0;
  let text = "";
  try {
    let chunk = await reader.read();
    while (!chunk.done) {
      const { value } = chunk;
      size += value.byteLength;
      if (size > MAX_ANALYTICS_BYTES) {
        await reader.cancel();
        throw new Response("Payload too large", { status: 413 });
      }
      text += decoder.decode(value, { stream: true });
      chunk = await reader.read();
    }
    text += decoder.decode();
  } finally {
    reader.releaseLock();
  }
  try { return JSON.parse(text); } catch { return null; }
}

function clean(value, limit) {
  return typeof value === "string"
    ? value.slice(0, limit).replace(/[^\w\-/.:?&#= ]/g, "")
    : null;
}

export function normalizeAnalyticsEvent(event, shop) {
  if (!event || !EVENT_TYPES.has(event.type)) return null;
  return {
    // Scope client IDs to the authenticated shop; older trackers still work.
    id: typeof event.id === "string" && UUID.test(event.id)
      ? `${shop}:${event.id.toLowerCase()}` : crypto.randomUUID(),
    shop,
    blockName: clean(event.blockName, 64) || "unknown",
    eventType: event.type,
    productId: clean(event.productId, 128),
    variantId: clean(event.variantId, 128),
    pageUrl: clean(event.pageUrl, 512),
  };
}
