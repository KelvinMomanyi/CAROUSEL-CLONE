# Carousel-CLONE — Shopify App

A Shopify embedded app built with React Router v7, Prisma (SQLite), and the Shopify CLI. Includes a `carousel-sliders` extension.

## Stack

- **Framework**: React Router v7 (forked from Shopify Remix template)
- **Auth/API**: `@shopify/shopify-app-react-router`
- **Database**: Prisma + SQLite (`prisma/dev.sqlite`)
- **Extensions**: `extensions/carousel-sliders`

## Running locally on Replit

The app is run via the **"Start application"** workflow, which executes:

```
shopify app dev
```

This starts a Cloudflare tunnel, injects environment variables (`SHOPIFY_API_KEY`, `SHOPIFY_API_SECRET`, `SHOPIFY_APP_URL`, `SCOPES`), and serves the app.

**First-run authentication**: On the first run, the Shopify CLI will print a URL in the workflow console asking you to authenticate with your Shopify Partners account. Open that URL in your browser, complete the login, and the CLI will continue startup automatically.

## Environment variables

The Shopify CLI injects all required vars during `shopify app dev`. No manual secrets are required for local development beyond Shopify Partners account access.

| Variable | Source |
|---|---|
| `SHOPIFY_API_KEY` | Injected by CLI (from `shopify.app.toml` `client_id`) |
| `SHOPIFY_API_SECRET` | Injected by CLI |
| `SHOPIFY_APP_URL` | Injected by CLI (tunnel URL) |
| `SCOPES` | Injected by CLI (from `shopify.app.toml`) |
| `SESSION_SECRET` | Set as Replit secret |

## Database

Prisma with SQLite. Schema lives in `prisma/schema.prisma`. Migration already applied (`dev.sqlite` is created at `prisma/dev.sqlite`).

To re-run migrations: `npx prisma migrate deploy`
To explore the DB: `npx prisma studio`

## Key files

- `app/shopify.server.js` — Shopify app config and session storage
- `app/routes/` — All route handlers
- `shopify.app.toml` — Shopify app config (deploy/production)
- `shopify.app.local.toml` — Local dev config (no webhooks, localhost)
- `extensions/carousel-sliders/` — Shopify extension

## User preferences

- Keep the existing React Router / Shopify CLI stack — do not migrate or restructure.
