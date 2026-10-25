# Hobby resource efficiency

The storefront carousel still renders from the theme extension. Its animations,
product imagery, cart actions, and access rules are unchanged by these changes.
Analytics retains every tracked event; there is no sampling.

## Implemented

- Vite prepares content-versioned preview assets in `public/preview-assets`.
  Production serves these files statically with a one-year immutable browser
  cache. A changed asset produces a new directory version. Relative references
  between CSS, scripts, fonts, and images remain intact.
- Public demo HTML has a one-hour Vercel CDN TTL. Authenticated pages and billing
  responses are never shared through that cache.
- Library cards mount interactive previews as they approach the viewport.
  Full-size previews remain interactive.
- Storefront analytics batches for at most 15 seconds or 50 events, with a flush
  on page hide. Foreground delivery retries a transient failure once, with stable
  IDs scoped to the authenticated shop so a duplicate batch is not counted twice.
  Browsers without UUID support retain ingestion but do not retry automatically.
  Delivery on browser shutdown remains best-effort, as with the previous tracker.
- Ingestion rejects bodies over 64 KiB while streaming, including requests with
  no Content-Length. Event counts and fields are bounded before database work.
  Existing per-instance burst limiting is retained, with bounded map growth.
- Routine shop-plan and subscription refreshes use database-backed timestamps
  with 15-minute and 5-minute freshness intervals. Checkout returns, pricing
  requests, mutations, and shop updates bypass the relevant freshness check.
  Subscription webhooks still update access immediately. A missed subscription
  webhook is reconciled by the next eligible request after the freshness window.
- Storefront entitlement writes are skipped when the successfully synchronized
  snapshot is unchanged. Changes and expiry invalidate that snapshot; a daily
  refresh on a subsequent request also repairs missing/out-of-band changes.
  Failed writes are not marked synchronized, and a concurrent update invalidates
  the cached acknowledgment for repair on the next request.

## Release

1. Apply `20261025000000_billing_refresh_cache` before running the new server.
   It only adds nullable columns. The existing Vercel build command already runs
   `npm run setup` (Prisma generation and migration deployment) before building.
   Local environments need `npm run setup` against their development database.
2. Deploy the application through the existing Vercel release process.
3. Publish the updated theme extension through the existing Shopify release
   process. Until then installed storefronts keep their previous tracker; the
   ingestion endpoint accepts both old and new event formats.
4. Verify billing approval/cancellation with a development store and compare
   Usage before and after rollout. Cached billing reads must never bypass
   Shopify request authentication.

Checks: `npm run test:scaling`, `npm run lint`, `npm run typecheck`, and
`npm run build`. After building, `npm run test:preview-build` checks every library
preview and verifies its referenced files exist in the build output.

## Capacity and follow-up operations

These optimizations reduce work, but cannot guarantee unlimited traffic within a
fixed Hobby quota. Compare request counts, active CPU, provisioned memory, and
transfer over the same date range before and after release. API/DB waiting time
still consumes provisioned memory, even while active CPU accounting is paused.

Use a serverless-compatible pooled Postgres connection URL from the database
provider. Do not automatically rewrite connection options or move the database;
verify provider limits and function/database locations first.

The in-process analytics limiter is a burst guard, not a shared quota control.
An edge firewall policy or a shared limiter requires traffic-specific thresholds
to avoid blocking legitimate shoppers. No paid service or blanket bot block has
been provisioned by this patch.

Automatic deletion of historical analytics is not enabled by this patch. Before
scheduling retention, backfill and verify daily summaries and product reports;
the existing raw-event cleanup is not safe to schedule independently of that
work. No analytics history has been removed.
