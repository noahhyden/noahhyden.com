/**
 * The whole build: compile each page's .tsx, render it through pimas/server's
 * string backend in Node, and write one static HTML file per route. No Vite, no
 * meta-framework — for a handful of pages a plain esbuild + render loop is the
 * smallest honest pipeline (and the one we can read top to bottom).
 *
 * Output is fully static, zero JavaScript. The footer's build metrics are
 * measured here and injected into the HTML.
 */
import { build as esbuild } from "esbuild";
import { gzipSync } from "node:zlib";
import { mkdir, writeFile, rm, readFile, cp, access } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { performance } from "node:perf_hooks";
import { createRequire } from "node:module";
import { pathToFileURL } from "node:url";

const ROOT = import.meta.dirname;
const OUT = resolve(ROOT, "../dist");
const CACHE = resolve(ROOT, ".cache/pages");
const require = createRequire(import.meta.url);

// The route table is just data — sitemap, etc. fall out of it.
const ROUTES = [
  { url: "/", page: "index" },
  { url: "/about/", page: "about" },
  { url: "/projects/", page: "projects" },
  { url: "/writing/", page: "writing" },
];

const pimasVersion = require("pimas/package.json").version || "0.0.0";

async function bundlePage(page) {
  // Bundle for Node, automatic JSX → pimas. The page imports renderToString from
  // pimas/server (string backend) and JSX resolves to pimas/jsx-runtime; no DOM
  // backend is pulled in, so nothing touches `document`.
  await esbuild({
    entryPoints: [resolve(ROOT, `src/pages/${page}.tsx`)],
    outfile: join(CACHE, `${page}.mjs`),
    bundle: true,
    format: "esm",
    platform: "node",
    jsx: "automatic",
    jsxImportSource: "pimas",
    // Keep pimas EXTERNAL: bundling it would inline a second copy of the engine
    // with its own currentBackend global (the dual-kernel hazard), so the page's
    // h() and renderToString() would touch different backends. External → both
    // resolve to the one installed package → exactly one kernel instance.
    external: ["pimas", "pimas/*"],
    logLevel: "warning",
  });
  return import(pathToFileURL(join(CACHE, `${page}.mjs`)).href + `?t=${process.hrtime.bigint()}`);
}

function sitemap(routes) {
  const urls = routes
    .map((r) => `  <url><loc>https://noahhyden.com${r.url}</loc></url>`)
    .join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.w3.org/2000/sitemap/0.9">\n${urls}\n</urlset>\n`;
}

async function main() {
  const { renderToString } = await import("pimas/server");

  // headHTML/TOKENS are build-only (not in the page tree), so compile design.ts
  // on its own and import it here.
  await esbuild({
    entryPoints: [resolve(ROOT, "src/design.ts")],
    outfile: join(CACHE, "design.mjs"),
    bundle: true,
    format: "esm",
    platform: "node",
    logLevel: "warning",
  });
  const { headHTML, TOKENS } = await import(pathToFileURL(join(CACHE, "design.mjs")).href);

  await rm(OUT, { recursive: true, force: true });

  for (const route of ROUTES) {
    const mod = await bundlePage(route.page);
    const Page = mod.default;
    const meta = mod.meta;

    // A page may prerender data at build time (e.g. projects fetches GitHub),
    // so the shipped page makes zero runtime requests.
    const data = mod.getData ? await mod.getData() : {};

    const t0 = performance.now();
    const body = renderToString(() => Page(data));
    const renderMs = (performance.now() - t0).toFixed(2);

    let html = `<!doctype html>\n<html lang="en">\n<head>\n${headHTML(meta)}\n</head>\n<body>\n${body}\n</body>\n</html>\n`;

    // Inject the honest build metrics. JS shipped is literally 0 (no <script>).
    const htmlKb = (gzipSync(Buffer.from(html)).length / 1024).toFixed(1);
    html = html
      .replaceAll(TOKENS.renderMs, renderMs)
      .replaceAll(TOKENS.jsBytes, "0")
      .replaceAll(TOKENS.htmlKb, htmlKb)
      .replaceAll(TOKENS.pimasVer, pimasVersion)
      .replaceAll(TOKENS.builtAt, new Date().toISOString().slice(0, 10));

    const file = join(OUT, route.url === "/" ? "index.html" : `${route.url}index.html`);
    await mkdir(dirname(file), { recursive: true });
    await writeFile(file, html);
    console.log(`  ${route.url.padEnd(18)} ${htmlKb} KB gz · ${renderMs} ms · 0 KB JS`);
  }

  // Generated + passthrough files.
  await writeFile(join(OUT, "sitemap.xml"), sitemap(ROUTES));
  await writeFile(join(OUT, "robots.txt"), "Sitemap: https://noahhyden.com/sitemap.xml\n");
  await writeFile(join(OUT, ".nojekyll"), "");
  await writeFile(join(OUT, "CNAME"), "noahhyden.com\n");
  for (const asset of ["uploads", "screenshots"]) {
    const src = resolve(ROOT, "..", asset);
    if (await access(src).then(() => true, () => false)) {
      await cp(src, join(OUT, asset), { recursive: true });
    }
  }

  console.log(`\n✓ built ${ROUTES.length} route(s) → dist/  (pimas v${pimasVersion}, 0 KB JS shipped)`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
