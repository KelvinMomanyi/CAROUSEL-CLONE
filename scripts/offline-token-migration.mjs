export const SHOP_DOMAIN = /^[a-z0-9][a-z0-9-]*\.myshopify\.com$/;

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
  const { session } = await exchange({ shop: row.shop, nonExpiringOfflineAccessToken: row.accessToken });
  if (session.shop !== row.shop || session.isOnline ||
      !session.accessToken || !session.refreshToken ||
      !(session.expires instanceof Date) || session.expires.getTime() <= now() ||
      !(session.refreshTokenExpires instanceof Date) || session.refreshTokenExpires.getTime() <= now()) {
    throw new Error("incomplete_migration_response");
  }
  // CAS: do not overwrite a session that was replaced by live authentication.
  const count = await save(row, {
    accessToken: session.accessToken,
    expires: session.expires,
    refreshToken: session.refreshToken,
    refreshTokenExpires: session.refreshTokenExpires,
    refreshTokenExpiresAt: session.refreshTokenExpires,
    scope: session.scope ?? row.scope,
  });
  return count === 1 ? "migrated" : "concurrent_change_requires_audit";
}
