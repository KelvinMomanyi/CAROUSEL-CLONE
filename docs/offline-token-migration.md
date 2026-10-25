# Expiring offline access token migration

The app already enables `future.expiringOfflineAccessTokens` and stores `expires`,
`refreshToken`, and `refreshTokenExpires` in the Session table. The installed SDK
refreshes offline sessions used by app proxies, webhooks, and unauthenticated
Admin clients. Shop-plan queries now use that managed client too, rather than a
copied access token passed directly to fetch.

The flag does not retroactively exchange non-expiring sessions. The email's 63
tokens is a historical count; check the production database before migration.

For a read-only check of whether legacy tokens are currently accepted, run
`npm run tokens:audit -- --verify`. Stored installation labels are local database
metadata, not authoritative confirmation from Shopify. Verification does not
exchange tokens or modify records. A 401 means the stored token was rejected;
a 404 means the store/API endpoint was not available to that request. Neither
alone proves why access ended or authorizes deleting merchant records. Reconcile
store status, then have any still-active merchant reopen the app to reauthenticate.

## Runbook

1. Verify the production database has the existing refresh-token migrations.
   Release and verify the server changes before migrating tokens. New code also
   includes the separate billing-cache migration described in hobby-scaling.md.
2. Use the production app's own DATABASE_URL, SHOPIFY_API_KEY, and
   SHOPIFY_API_SECRET in the migration process environment. Never put them in a
   command argument or commit them. A local ignored `.env` is also supported.
3. Run `npm run tokens:audit`. This is read-only and does not request or exchange
   any tokens. It reports legacy, expiring, incomplete, and expired-refresh counts and lists up
   to 100 legacy shops with their stored installation status. It never prints tokens. Confirm this is the intended app
   and merchant database; use `-- --shop example.myshopify.com` to inspect one.
4. Migrate one confirmed shop first:
   `npm run tokens:migrate -- --shop example.myshopify.com --expected-client-id YOUR_PUBLIC_APP_CLIENT_ID`.
   This uses Shopify's official `auth.migrateToExpiringToken` method and saves the
   returned access token, refresh token, scope, and both expiry dates. The public
   client ID must match the environment to protect against the wrong app.
5. Verify authenticated admin navigation, an app proxy request, and token refresh
   after access-token expiry on that store. Then run the command without `--shop`
   to migrate the remaining eligible sessions sequentially (default limit 100).
   Run only one migration process at a time, during a quiet traffic period.
6. Repeat `npm run tokens:audit` until legacy is zero. Investigate incomplete
   records and expired refresh credentials separately; they can require merchant
   reauthentication. The script intentionally does not guess how to repair them.

Migration permanently invalidates the old token for GraphQL Admin API requests.
It is not a reversible database-only change, so do not run apply mode before
reviewing the audit and verifying refresh support in production. Merchants do
not ordinarily need to reinstall the app.

The script stops on the first exchange/storage error or concurrent session
replacement. It does not print SDK error bodies because they can contain tokens.
Uninstalled stores and sessions without a matching installation record are
skipped in apply mode for separate review.
If the response was lost or storage failed, keep the original DB record and
retry promptly: Shopify allows eligible recovery with the original token for
seven days, until the new pair is refreshed or superseded. If recovery is
rejected, have the merchant reopen the app to acquire a fresh session. Do not
restore a revoked token from a backup or overwrite newer session credentials.

The command's compare-and-set prevents overwriting sessions replaced by live
authentication. A successful save also clears the unused Shop.accessToken copy;
Session storage remains the source of truth.

## Validation

`npm run test:tokens` covers response persistence, skip rules, failed storage,
concurrent replacement, and refresh-field round-tripping through the installed
Prisma session adapter. Run the scaling regression tests and production build as
well. Unit tests do not prove that production's 63 sessions have been migrated.

References:
- https://shopify.dev/docs/apps/build/authentication-authorization/migrate-to-expiring-offline-access-tokens
- https://github.com/Shopify/shopify-app-js/blob/main/packages/apps/shopify-api/docs/reference/auth/migrateToExpiringToken.md
