import "@shopify/shopify-api/adapters/node";
import { shopifyApi, ApiVersion, LogSeverity, Session } from "@shopify/shopify-api";
import { PrismaClient } from "@prisma/client";
import { parseArgs } from "node:util";
import { createInterface } from "node:readline";
import { migrateOfflineSession, safeMigrationFailure, SHOP_DOMAIN } from "./offline-token-migration.mjs";

const { values } = parseArgs({ options: {
  apply: { type: "boolean", default: false },
  verify: { type: "boolean", default: false },
  shop: { type: "string" },
  limit: { type: "string", default: "100" },
  "expected-client-id": { type: "string" },
  "env-stdin": { type: "boolean", default: false },
} });
if (values["env-stdin"]) {
  // Allows an operator to inject credentials through a pipe, without placing
  // them in command arguments, shell history, or a temporary environment file.
  // Disable terminal echo as well when an operator uses an interactive PTY.
  if (process.stdin.isTTY) process.stdin.setRawMode(true);
  const input = createInterface({ input: process.stdin, terminal: false });
  for await (const line of input) {
    const env = JSON.parse(line);
    for (const key of ["DATABASE_URL", "SHOPIFY_API_KEY", "SHOPIFY_API_SECRET"]) {
      if (typeof env[key] === "string") process.env[key] = env[key];
    }
    input.close();
    if (process.stdin.isTTY) process.stdin.setRawMode(false);
    break;
  }
}
const limit = Number(values.limit);
if (!Number.isInteger(limit) || limit < 1 || limit > 1000 ||
    (values.shop && !SHOP_DOMAIN.test(values.shop))) throw new Error("Invalid shop or limit (1–1000)");
if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is required");
if (values.apply && values.verify) throw new Error("Use either --apply or --verify, not both");
if (values.apply && (!process.env.SHOPIFY_API_KEY || !process.env.SHOPIFY_API_SECRET ||
    values["expected-client-id"] !== process.env.SHOPIFY_API_KEY)) {
  throw new Error("Apply requires app credentials and a matching --expected-client-id");
}
if (values.verify && (!process.env.SHOPIFY_API_KEY || !process.env.SHOPIFY_API_SECRET)) {
  throw new Error("Verification requires the app credentials");
}

const prisma = new PrismaClient();
try {
  const base = { isOnline: false, ...(values.shop ? { shop: values.shop } : {}) };
  const legacy = { ...base, expires: null, refreshToken: null };
  const counts = {
    offline: await prisma.session.count({ where: base }),
    legacy: await prisma.session.count({ where: legacy }),
    expiring: await prisma.session.count({ where: {
      ...base, expires: { not: null }, refreshToken: { not: null }, refreshTokenExpires: { not: null },
    } }),
  };
  counts.incomplete = counts.offline - counts.legacy - counts.expiring;
  counts.expiredRefresh = await prisma.session.count({ where: {
    ...base, refreshTokenExpires: { lte: new Date() },
  } });
  console.log(JSON.stringify({ mode: values.apply ? "apply" : "audit", counts }));
  const rows = await prisma.session.findMany({ where: legacy, orderBy: { id: "asc" }, take: limit,
    select: { id: true, shop: true, isOnline: true, expires: true, refreshToken: true, scope: true,
      ...(values.apply || values.verify ? { accessToken: true } : {}) },
  });
  if (!values.apply) {
    for (const row of rows) {
      const installation = await prisma.shop.findUnique({ where: { shop: row.shop }, select: { uninstalledAt: true } });
      console.log(JSON.stringify({ shop: row.shop, status: "legacy",
        installation: !installation ? "unknown" : installation.uninstalledAt ? "uninstalled" : "installed" }));
      if (values.verify) {
        const api = shopifyApi({ apiKey: process.env.SHOPIFY_API_KEY,
          apiSecretKey: process.env.SHOPIFY_API_SECRET, hostName: "offline-migration.invalid",
          apiVersion: ApiVersion.July26, isEmbeddedApp: true,
          logger: { level: LogSeverity.Error, log: () => {} },
        });
        try {
          const client = new api.clients.Graphql({ session: new Session({ ...row, state: "" }) });
          const result = await client.request("query TokenMigrationCheck { currentAppInstallation { id } }");
          console.log(JSON.stringify({ shop: row.shop,
            status: result.data?.currentAppInstallation?.id ? "legacy_token_accepted_by_admin_api" : "no_installation_returned" }));
        } catch (error) {
          const detail = safeMigrationFailure(error);
          console.log(JSON.stringify({ shop: row.shop, status: "admin_api_verification_failed", ...detail, stage: "admin_api_verification" }));
          process.exitCode = 1;
        }
      }
    }
  } else {
    const api = shopifyApi({ apiKey: process.env.SHOPIFY_API_KEY,
      apiSecretKey: process.env.SHOPIFY_API_SECRET, hostName: "offline-migration.invalid",
      apiVersion: ApiVersion.July26, isEmbeddedApp: true,
      logger: { level: LogSeverity.Error, log: () => {} },
    });
    for (const row of rows) {
      try {
        const installation = await prisma.shop.findUnique({ where: { shop: row.shop }, select: { uninstalledAt: true } });
        if (!installation || installation.uninstalledAt) {
          console.log(JSON.stringify({ shop: row.shop, status: "skipped_not_confirmed_installed" }));
          continue;
        }
        const status = await migrateOfflineSession(row, {
          exchange: api.auth.migrateToExpiringToken,
          save: (original, data) => prisma.$transaction(async (tx) => {
            const result = await tx.session.updateMany({ where: { id: original.id,
              accessToken: original.accessToken, expires: null, refreshToken: null }, data });
            if (result.count) await tx.shop.updateMany({ where: { shop: original.shop }, data: { accessToken: null } });
            return result.count;
          }),
        });
        console.log(JSON.stringify({ shop: row.shop, status }));
        if (status !== "migrated") { process.exitCode = 1; break; }
      } catch (error) {
        // SDK/network errors may contain tokens. Never print raw errors or bodies.
        console.error(JSON.stringify({ shop: row.shop, status: "failed_stop_and_audit", ...safeMigrationFailure(error) }));
        process.exitCode = 1;
        break;
      }
    }
  }
} catch {
  console.error("Migration audit could not complete; verify database connectivity and schema. Credentials were not logged.");
  process.exitCode = 1;
} finally {
  await prisma.$disconnect();
}
