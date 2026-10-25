export const SUBSCRIPTION_REFRESH_MS = 5 * 60 * 1000;
export const SHOP_PLAN_REFRESH_MS = 15 * 60 * 1000;
export const ENTITLEMENT_REFRESH_MS = 24 * 60 * 60 * 1000;

export function isFresh(timestamp, interval, now = Date.now()) {
  if (!timestamp) return false;
  const age = now - new Date(timestamp).getTime();
  return age >= 0 && age < interval;
}

export function requiresImmediateBillingRefresh(request) {
  const url = new URL(request.url);
  return request.method !== "GET" || url.searchParams.has("charge_id") ||
    url.searchParams.get("billing_return") === "1" || url.pathname === "/app/pricing";
}

export function entitlementSyncKey(snapshot) {
  return JSON.stringify({
    active: snapshot.active,
    proAccess: snapshot.proAccess,
    planTier: snapshot.planTier,
    expiresAt: snapshot.expiresAt.toISOString(),
  });
}
