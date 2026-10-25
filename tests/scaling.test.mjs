import assert from "node:assert/strict";
import { readFileSync, mkdtempSync, mkdirSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { runInNewContext } from "node:vm";
import test from "node:test";
import { preparePreviewAssets } from "../scripts/preview-assets.mjs";
import { MAX_ANALYTICS_BYTES, normalizeAnalyticsEvent, readAnalyticsBody } from "../app/utils/analytics-ingestion.server.js";
import * as policy from "../app/utils/billing-refresh.server.js";

const trackerSource = readFileSync(new URL("../extensions/carousel-sliders/assets/carousel-analytics.js", import.meta.url), "utf8");

function tracker({ beaconAccepted = true, fetchResponse = { ok: true } } = {}) {
  const timers = new Map();
  const events = {};
  const calls = [];
  let nextTimer = 0;
  let nextId = 0;
  const document = {
    readyState: "complete", visibilityState: "visible",
    addEventListener(name, handler) { events[name] = handler; },
    querySelectorAll() { return []; },
  };
  const window = {
    location: { pathname: "/products/test" },
    crypto: { randomUUID() { return `00000000-0000-4000-8000-${String(++nextId).padStart(12, "0")}`; } },
    setTimeout(callback, delay) { const id = ++nextTimer; timers.set(id, { callback, delay }); return id; },
    clearTimeout(id) { timers.delete(id); },
    addEventListener(name, handler) { events[name] = handler; },
    fetch(url, options) { calls.push({ kind: "fetch", url, body: JSON.parse(options.body) }); return Promise.resolve(fetchResponse); },
  };
  const context = {
    window, document, Blob, WeakSet,
    navigator: { sendBeacon(url, body) { calls.push({ kind: "beacon", url, body }); return beaconAccepted; } },
  };
  runInNewContext(trackerSource, context);
  return { window, document, context, events, calls, timers, api: window.__carouselAnalytics };
}

test("three interactions share one bounded batch and lifecycle hooks do not duplicate it", async () => {
  const t = tracker();
  for (const type of ["impression", "click", "add_to_cart"]) t.api.track(type, { blockName: "slider" });
  assert.equal(t.calls.length, 0);
  assert.equal(t.timers.size, 1);
  assert.equal([...t.timers.values()][0].delay, 15000);
  t.document.visibilityState = "hidden";
  t.events.visibilitychange();
  t.events.pagehide();
  assert.equal(t.calls.length, 1);
  assert.equal(JSON.parse(await t.calls[0].body.text()).events.length, 3);
  runInNewContext(trackerSource, t.context);
  assert.equal(t.window.__carouselAnalytics, t.api);
});

test("batch limit, beacon fallback, and transient retry preserve IDs", async () => {
  const t = tracker({ beaconAccepted: false, fetchResponse: { ok: false, status: 503 } });
  for (let i = 0; i < 50; i++) t.api.track("click", { productId: "12" });
  assert.equal(t.calls[0].body.events.length, 50);
  await new Promise(setImmediate);
  const retry = [...t.timers.values()].find((entry) => entry.delay === 5000);
  assert.ok(retry);
  retry.callback();
  await new Promise(setImmediate);
  assert.deepEqual(t.calls[0].body, t.calls[1].body);
  const t2 = tracker({ beaconAccepted: false });
  t2.api.track("impression", {});
  t2.events.pagehide();
  assert.deepEqual(t2.calls.map((call) => call.kind), ["beacon", "fetch"]);
});

test("ingestion limits streamed bodies even without Content-Length", async () => {
  const request = new Request("https://example.test/proxy/analytics", { method: "POST", body: "x".repeat(MAX_ANALYTICS_BYTES + 1) });
  await assert.rejects(readAnalyticsBody(request), (error) => error.status === 413);
  assert.equal(await readAnalyticsBody(new Request("https://example.test", { method: "POST", body: "invalid" })), null);
});

test("event deduplication is stable within one shop and isolated between shops", () => {
  const event = { type: "click", id: "abcdefff-0000-4000-8000-000000000001", blockName: "slider" };
  assert.equal(normalizeAnalyticsEvent(event, "one").id, normalizeAnalyticsEvent(event, "one").id);
  assert.notEqual(normalizeAnalyticsEvent(event, "one").id, normalizeAnalyticsEvent(event, "two").id);
  assert.equal(normalizeAnalyticsEvent({ type: "unknown" }, "one"), null);
  assert.ok(normalizeAnalyticsEvent({ type: "impression" }, "one").id);
});

test("preview asset versions are stable and change when a dependency changes", () => {
  const root = mkdtempSync(join(tmpdir(), "carousel-preview-"));
  const source = join(root, "extensions/carousel-sliders/assets");
  mkdirSync(source, { recursive: true });
  writeFileSync(join(source, "slider.css"), 'body { background: url("image.svg"); }');
  writeFileSync(join(source, "image.svg"), "<svg/>");
  const first = preparePreviewAssets(root);
  assert.equal(preparePreviewAssets(root), first);
  assert.equal(readFileSync(join(root, "public", first, "image.svg"), "utf8"), "<svg/>");
  writeFileSync(join(source, "image.svg"), "<svg>updated</svg>");
  assert.notEqual(preparePreviewAssets(root), first);
});

// Inject services into the real billing modules without loading Shopify auth or a database.
function loadFunctions(path, services, names) {
  const source = readFileSync(new URL(path, import.meta.url), "utf8")
    .replace(/^import[\s\S]*?;\r?\n/gm, "")
    .replace(/^export /gm, "");
  return new Function(...Object.keys(services), `${source}\nreturn { ${names.join(",")} };`)(...Object.values(services));
}

function billingFixture({ failSync = false, concurrentUpdate = false } = {}) {
  let row = {
    shop: "test.myshopify.com", updatedAt: new Date(),
    isDevStore: false, hasActiveSubscription: false, currentPlan: "free",
    trialEndsAt: new Date(Date.now() + 86400000), gracePeriodEndsAt: new Date(Date.now() + 86400000),
    entitlementSyncKey: null,
  };
  const requests = [];
  const writes = [];
  let active = [];
  const merge = (data) => { row = { ...row, ...data, updatedAt: new Date() }; return row; };
  const prisma = { shop: {
    findUnique: async () => row,
    upsert: async ({ update }) => merge(update),
    update: async ({ data }) => merge(data),
    updateMany: async ({ where, data }) => {
      writes.push(data);
      if (concurrentUpdate && where.updatedAt) return { count: 0 };
      merge(data); return { count: 1 };
    },
  } };
  const state = loadFunctions("../app/utils/billing-state.server.js", {
    prisma, ...policy,
  }, ["syncShopFromShopify", "getPlanLimits", "createGracePeriodEnd", "isShopifyAuthError", "BILLING_PLAN", "BILLING_PLANS", "BILLING_TRIAL_DAYS", "BILLING_GRACE_DAYS"]);
  const admin = { graphql: async (query) => {
    if (query.includes("ShopBillingPlan")) { requests.push("plan"); return Response.json({ data: { shop: { plan: { publicDisplayName: "Basic", partnerDevelopment: false } } } }); }
    if (query.includes("CurrentAppInstallationSubscriptions")) { requests.push("subscription"); return Response.json({ data: { currentAppInstallation: { activeSubscriptions: active } } }); }
    if (query.includes("CurrentAppInstallationId")) { requests.push("installation"); return Response.json({ data: { currentAppInstallation: { id: "gid://shopify/AppInstallation/1" } } }); }
    requests.push("sync");
    return Response.json({ data: { metafieldsSet: { userErrors: failSync ? [{ message: "Temporary write failure" }] : [] } } });
  } };
  const billing = loadFunctions("../app/utils/billing.server.js", {
    prisma, ...state, ...policy,
    authenticate: { admin: async () => ({ admin, session: { shop: row.shop, accessToken: "test" } }) },
    unauthenticated: { admin: async () => ({ admin }) },
  }, ["requireBilling", "updateSubscriptionStatus", "syncBillingMetafields", "getBillingMetafieldSnapshot"]);
  return { billing, requests, writes, admin, get row() { return row; }, setActive(value) { active = value; } };
}

test("routine billing refresh uses persisted state; checkout and cancellation refresh immediately", async () => {
  const t = billingFixture();
  const request = new Request("https://example.test/app");
  await t.billing.requireBilling(request);
  assert.deepEqual(t.requests, ["plan", "subscription", "installation", "sync"]);
  t.requests.length = 0;
  await t.billing.requireBilling(request);
  assert.deepEqual(t.requests, []);
  t.setActive([{ id: "gid://shopify/AppSubscription/1", status: "ACTIVE", name: "Pro" }]);
  const approved = await t.billing.requireBilling(new Request("https://example.test/app?billing_return=1"));
  assert.equal(approved.billing.hasActiveSubscription, true);
  assert.deepEqual(t.requests, ["plan", "subscription", "installation", "sync"]);
  t.requests.length = 0;
  const cancelled = await t.billing.updateSubscriptionStatus(t.row.shop, { status: "CANCELLED" });
  await t.billing.syncBillingMetafields({ admin: { graphql: async (query) => {
    t.requests.push(query.includes("CurrentAppInstallationId") ? "installation" : "sync");
    return Response.json({ data: { currentAppInstallation: { id: "gid://shopify/AppInstallation/1" }, metafieldsSet: { userErrors: [] } } });
  } }, shop: cancelled });
  assert.equal(t.row.hasActiveSubscription, false);
  assert.deepEqual(t.requests, ["installation", "sync"]);
});

test("billing refresh boundaries and trial expiry invalidate the appropriate cache", () => {
  assert.equal(policy.isFresh(new Date(1000), 5000, 6000), false);
  assert.equal(policy.isFresh(new Date(7000), 5000, 6000), false);
  assert.equal(policy.requiresImmediateBillingRefresh(new Request("https://example.test/app?charge_id=1")), true);
  assert.equal(policy.requiresImmediateBillingRefresh(new Request("https://example.test/app/pricing")), true);
  const t = billingFixture();
  const before = t.billing.getBillingMetafieldSnapshot(t.row);
  const after = t.billing.getBillingMetafieldSnapshot({ ...t.row, trialEndsAt: new Date(0), gracePeriodEndsAt: new Date(0) });
  assert.notEqual(policy.entitlementSyncKey(before), policy.entitlementSyncKey(after));
});

test("failed entitlement writes remain retryable and concurrent updates invalidate acknowledgments", async () => {
  const failed = billingFixture({ failSync: true });
  await assert.rejects(failed.billing.syncBillingMetafields({ admin: failed.admin, shop: failed.row }), /Temporary write failure/);
  assert.equal(failed.writes.length, 0);
  assert.equal(failed.row.entitlementSyncKey, null);
  const concurrent = billingFixture({ concurrentUpdate: true });
  await concurrent.billing.syncBillingMetafields({ admin: concurrent.admin, shop: concurrent.row });
  assert.equal(concurrent.writes.length, 2);
  assert.equal(concurrent.row.entitlementSyncKey, null);
  assert.equal(concurrent.row.entitlementSyncedAt, null);
});

test("unchanged entitlements are repaired after the persisted refresh interval", async () => {
  const t = billingFixture();
  await t.billing.syncBillingMetafields({ admin: t.admin, shop: t.row });
  t.requests.length = 0;
  await t.billing.syncBillingMetafields({ admin: t.admin, shop: t.row });
  assert.deepEqual(t.requests, []);
  await t.billing.syncBillingMetafields({ admin: t.admin, shop: {
    ...t.row, entitlementSyncedAt: new Date(Date.now() - policy.ENTITLEMENT_REFRESH_MS - 1),
  } });
  assert.deepEqual(t.requests, ["installation", "sync"]);
});
