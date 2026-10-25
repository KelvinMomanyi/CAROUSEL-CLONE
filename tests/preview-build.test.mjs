import assert from "node:assert/strict";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import test from "node:test";

// This smoke test never contacts Shopify or a database.
process.env.SHOPIFY_API_KEY = "preview-build-test";
process.env.SHOPIFY_API_SECRET = "preview-build-test-secret";
process.env.SHOPIFY_APP_URL = "https://preview.example.test";
process.env.DATABASE_URL = "postgresql://test:test@localhost:5432/unused";
// The session adapter probes its table during module initialization, even for
// public preview routes. Satisfy that probe without opening a DB connection.
globalThis.prismaGlobal = { session: { count: async () => 0 } };

const serverRoot = resolve("build/server");
const bundle = existsSync(join(serverRoot, "index.js")) ? join(serverRoot, "index.js") :
  join(serverRoot, readdirSync(serverRoot).find((name) => name.startsWith("nodejs_")), "index.js");
const build = await import(pathToFileURL(bundle));
const loader = build.routes["routes/preview.$handle"].module.loader;
const source = readFileSync("app/routes/app._index.jsx", "utf8");
const handles = [...source.matchAll(/handle: "([\w-]+)"/g)].map((match) => match[1]);

test("every library preview renders and references assets present in the production build", async () => {
  assert.ok(handles.length > 10);
  for (const handle of handles) {
    for (const suffix of ["", "?surface=library"]) {
      const response = await loader({ params: { handle }, request: new Request(`https://preview.example.test/preview/${handle}${suffix}`) });
      assert.equal(response.status, 200, handle);
      assert.match(response.headers.get("Vercel-CDN-Cache-Control"), /s-maxage=3600/);
      const html = await response.text();
      if (!suffix) {
        const assets = [...html.matchAll(/(?:src|href)="(\/preview-assets\/[^"\s]+)"/g)];
        assert.ok(assets.length >= 1, handle);
        for (const [, asset] of assets) assert.ok(existsSync(join("build/client", asset)), asset);
        assert.ok(!html.includes("/extension-assets/"));
      } else assert.ok(html.includes(`src="/preview/${handle}"`));
    }
  }
});

test("unknown preview handles return 404 instead of reflecting untrusted input", async () => {
  const response = await loader({ params: { handle: "<script>" }, request: new Request("https://preview.example.test/preview/unknown") });
  assert.equal(response.status, 404);
  assert.ok(!(await response.text()).includes("<script>"));
});
