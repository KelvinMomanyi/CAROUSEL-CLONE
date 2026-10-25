import assert from "node:assert/strict";
import test from "node:test";
import { migrateOfflineSession } from "../scripts/offline-token-migration.mjs";
import "@shopify/shopify-api/adapters/node";
import { Session } from "@shopify/shopify-api";
import { PrismaSessionStorage } from "@shopify/shopify-app-session-storage-prisma";

const legacy = { id: "offline_example.myshopify.com", shop: "example.myshopify.com", isOnline: false,
  accessToken: "legacy-test-token", scope: "read_products", expires: null, refreshToken: null };
function issued() {
  return new Session({ id: legacy.id, shop: legacy.shop, state: "", isOnline: false,
    accessToken: "expiring-test-token", refreshToken: "refresh-test-token", scope: "read_products",
    expires: new Date(Date.now() + 3600000), refreshTokenExpires: new Date(Date.now() + 86400000) });
}

test("legacy migration persists the full SDK response and both refresh expiry columns", async () => {
  const session = issued();
  const status = await migrateOfflineSession(legacy, {
    exchange: async (params) => {
      assert.equal(params.nonExpiringOfflineAccessToken, legacy.accessToken);
      assert.equal(params.shop, legacy.shop);
      return { session };
    },
    save: async (original, data) => {
      assert.equal(original, legacy);
      assert.equal(data.accessToken, session.accessToken);
      assert.equal(data.refreshToken, session.refreshToken);
      assert.equal(data.expires, session.expires);
      assert.equal(data.refreshTokenExpires, session.refreshTokenExpires);
      assert.equal(data.refreshTokenExpiresAt, session.refreshTokenExpires);
      return 1;
    },
  });
  assert.equal(status, "migrated");
  assert.ok(!status.includes("token"));
});

test("online, already-expiring, and incomplete sessions are not exchanged", async () => {
  const services = { exchange: () => assert.fail("must not exchange"), save: () => assert.fail("must not save") };
  for (const row of [{ ...legacy, isOnline: true }, { ...legacy, expires: new Date() }, { ...legacy, refreshToken: "existing" }]) {
    assert.equal(await migrateOfflineSession(row, services), "skipped");
  }
  await assert.rejects(migrateOfflineSession({ ...legacy, shop: "malicious.example" }, services), /invalid_legacy_session/);
});

test("incomplete exchange responses are not persisted; write failures remain recoverable", async () => {
  await assert.rejects(migrateOfflineSession(legacy, {
    exchange: async () => ({ session: { ...issued(), refreshToken: null } }),
    save: () => assert.fail("must not save incomplete credentials"),
  }), /incomplete_migration_response/);
  await assert.rejects(migrateOfflineSession(legacy, {
    exchange: async () => ({ session: issued() }),
    save: async () => { throw new Error("Database unavailable"); },
  }), /Database unavailable/);
  assert.equal(legacy.accessToken, "legacy-test-token");
});

test("concurrent authentication is not reported as a completed migration", async () => {
  assert.equal(await migrateOfflineSession(legacy, {
    exchange: async () => ({ session: issued() }), save: async () => 0,
  }), "concurrent_change_requires_audit");
});

test("the installed Prisma adapter round-trips access and refresh metadata", async () => {
  let saved;
  const storage = new PrismaSessionStorage({ session: {
    count: async () => 0,
    upsert: async ({ create }) => { saved = create; },
    findUnique: async () => saved,
  } });
  const session = issued();
  await storage.storeSession(session);
  const restored = await storage.loadSession(session.id);
  assert.equal(restored.accessToken, session.accessToken);
  assert.equal(restored.refreshToken, session.refreshToken);
  assert.equal(restored.expires.getTime(), session.expires.getTime());
  assert.equal(restored.refreshTokenExpires.getTime(), session.refreshTokenExpires.getTime());
});
