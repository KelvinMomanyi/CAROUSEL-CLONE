export const SHOP_DOMAIN = /^[a-z0-9][a-z0-9-]*\.myshopify\.com$/;

export function safeMigrationFailure(error) {
  const source = error?.cause || error;
  const detail = { stage: ["exchange", "response_validation", "persistence"].includes(error?.migrationStage)
    ? error.migrationStage : "installation_lookup" };
  const status = source?.response?.code ?? source?.response?.status;
  if (Number.isInteger(status) && status >= 100 && status <= 599) detail.httpStatus = status;
  const oauth = source?.response?.body?.error;
  const reasons = ["invalid_subject_token", "invalid_requested_token_type", "invalid_client", "invalid_request", "invalid_grant", "access_denied", "unauthorized_client", "shop_inactive", "forbidden"];
  if (reasons.includes(oauth)) detail.reason = oauth;
  const headers = source?.response?.headers || source?.headers;
  const requestId = headers?.get?.("x-request-id") ?? headers?.["x-request-id"] ?? headers?.["X-Request-Id"];
  if (typeof requestId === "string" && /^[a-zA-Z0-9-]{8,100}$/.test(requestId)) detail.requestId = requestId;
  if (/^P\d{4}$/.test(source?.code || "")) detail.databaseCode = source.code;
  const network = source?.cause?.code || source?.code;
  if (["ENOTFOUND", "ECONNRESET", "ECONNREFUSED", "ETIMEDOUT", "UND_ERR_CONNECT_TIMEOUT"].includes(network)) {
    detail.networkCode = network;
  }
  if (["invalid_legacy_session", "incomplete_migration_response"].includes(source?.message)) detail.reason = source.message;
  return detail;
}

async function migrationStep(stage, operation) {
  try { return await operation(); } catch (cause) {
    const error = new Error("Migration step failed", { cause });
    error.migrationStage = stage;
    throw error;
  }
}

export function isLegacyOfflineSession(row) {
  return !row.isOnline && row.expires == null && !row.refreshToken;
}

// Exchange and persistence are injected so migration failures can be tested
// without touching a merchant's credentials. Never return credentials to logs.
export async function migrateOfflineSession(row, { exchange, save, now = Date.now }) {
  if (!isLegacyOfflineSession(row)) return "skipped";
  if (!SHOP_DOMAIN.test(row.shop) || row.id !== `offline_${row.shop}` || !row.accessToken) {
    throw new Error("invalid_legacy_session");
  }
  const { session } = await migrationStep("exchange", () => exchange({ shop: row.shop, nonExpiringOfflineAccessToken: row.accessToken }));
  if (session.shop !== row.shop || session.isOnline ||
      !session.accessToken || !session.refreshToken ||
      !(session.expires instanceof Date) || session.expires.getTime() <= now() ||
      !(session.refreshTokenExpires instanceof Date) || session.refreshTokenExpires.getTime() <= now()) {
    throw new Error("incomplete_migration_response");
  }
  // CAS: do not overwrite a session that was replaced by live authentication.
  const count = await migrationStep("persistence", () => save(row, {
    accessToken: session.accessToken,
    expires: session.expires,
    refreshToken: session.refreshToken,
    refreshTokenExpires: session.refreshTokenExpires,
    refreshTokenExpiresAt: session.refreshTokenExpires,
    scope: session.scope ?? row.scope,
  }));
  return count === 1 ? "migrated" : "concurrent_change_requires_audit";
}
