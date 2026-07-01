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
import { mkdir, writeFile, rm, readFile, readdir, cp, access } from "node:fs/promises";
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
  { url: "/design-language/", page: "design-language" },
];

const pimasVersion = require("pimas/package.json").version || "0.0.0";

// ── Islands ───────────────────────────────────────────────────────────────
// Interactive components shipped as their own lazy-loaded client bundles. The
// static shell stays 0 KB JS; only pages that mount an island load any script.
// Keep each slug in sync with the `<Island slug=...>` used in a page.
const ISLAND_BOOT = "src/islands/boot.ts";
const ISLANDS = [
  { slug: "accordion", entry: "src/islands/accordion.tsx" },
];

// Build every island + the boot entry into one client bundle set. `splitting`
// factors the shared pimas kernel into a single chunk — so boot and all islands
// share ONE kernel instance in the browser (no dual-kernel hazard). Unlike the
// SSR page build, pimas is NOT external here: the browser needs it bundled.
// Returns the total gzipped JS an island page ships (all files in dist/islands).
async function buildIslands() {
  const outdir = join(OUT, "islands");
  await esbuild({
    entryPoints: [
      { in: resolve(ROOT, ISLAND_BOOT), out: "boot" },
      ...ISLANDS.map((i) => ({ in: resolve(ROOT, i.entry), out: i.slug })),
    ],
    outdir,
    bundle: true,
    splitting: true,
    format: "esm",
    platform: "browser",
    jsx: "automatic",
    jsxImportSource: "pimas",
    minify: true,
    logLevel: "warning",
  });
  let bytes = 0;
  for (const f of await readdir(outdir)) {
    if (f.endsWith(".js")) bytes += gzipSync(await readFile(join(outdir, f))).length;
  }
  return (bytes / 1024).toFixed(1); // KB gz shipped by any island page
}

// ── Self-hosted fonts ───────────────────────────────────────────────────────
// Vendored from Fontsource (OFL), woff2 only, latin + latin-ext subsets. All
// static instances — Spectral/Plex Mono have no variable build, and for these
// narrow axes static is both smaller and simpler. This is what makes the site
// truly zero-external-request: fonts are served from our own origin.
const FONT_SUBSETS = ["latin", "latin-ext"];
const FONT_FACES = [
  { fam: "spectral", css: "Spectral", weight: 400, style: "normal" },
  { fam: "spectral", css: "Spectral", weight: 500, style: "normal" },
  { fam: "spectral", css: "Spectral", weight: 600, style: "normal" },
  { fam: "spectral", css: "Spectral", weight: 400, style: "italic" },
  { fam: "ibm-plex-sans", css: "IBM Plex Sans", weight: 400, style: "normal" },
  { fam: "ibm-plex-sans", css: "IBM Plex Sans", weight: 500, style: "normal" },
  { fam: "ibm-plex-sans", css: "IBM Plex Sans", weight: 600, style: "normal" },
  { fam: "ibm-plex-mono", css: "IBM Plex Mono", weight: 400, style: "normal" },
  { fam: "ibm-plex-mono", css: "IBM Plex Mono", weight: 500, style: "normal" },
];
// Standard Google/Fontsource unicode-ranges. latin already covers the
// typographic punctuation we use (em dash, curly quotes, ×, °, ·, en/em space);
// latin-ext carries any accented place names and loads only when one appears.
const UNICODE_RANGE = {
  latin: "U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+0304,U+0308,U+0329,U+2000-206F,U+2074,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD",
  "latin-ext": "U+0100-02BA,U+02BD-02C5,U+02C7-02CC,U+02CE-02D7,U+02DD-02FF,U+0304,U+0308,U+0329,U+1D00-1DBF,U+1E00-1E9F,U+1EF2-1EFF,U+2020,U+20A0-20AB,U+20AD-20C0,U+2113,U+2C60-2C7F,U+A720-A7FF",
};
// Faces that paint above the fold (LCP) — preload these (and only these) so
// they win before first paint: the Spectral 500 hero headline and the IBM Plex
// Sans 400 body copy.
const FONT_PRELOAD = ["spectral-latin-500-normal.woff2", "ibm-plex-sans-latin-400-normal.woff2"];

const fontFile = (f, subset) => `${f.fam}-${subset}-${f.weight}-${f.style}.woff2`;

async function copyFonts() {
  const dir = join(OUT, "fonts");
  await mkdir(dir, { recursive: true });
  const seenLicense = new Set();
  for (const f of FONT_FACES) {
    for (const subset of FONT_SUBSETS) {
      const name = fontFile(f, subset);
      await cp(require.resolve(`@fontsource/${f.fam}/files/${name}`), join(dir, name));
    }
    if (!seenLicense.has(f.fam)) {
      seenLicense.add(f.fam);
      // OFL requires shipping the license + copyright notice with the fonts.
      await cp(require.resolve(`@fontsource/${f.fam}/LICENSE`), join(dir, `${f.fam}-OFL.txt`));
    }
  }
}

function fontFaceCSS() {
  const blocks = [];
  for (const f of FONT_FACES) {
    for (const subset of FONT_SUBSETS) {
      blocks.push(
        `@font-face{font-family:'${f.css}';font-style:${f.style};font-weight:${f.weight};` +
          `font-display:swap;src:url('/fonts/${fontFile(f, subset)}') format('woff2');` +
          `unicode-range:${UNICODE_RANGE[subset]};}`,
      );
    }
  }
  return blocks.join("");
}

function fontHead() {
  const preload = FONT_PRELOAD.map(
    (file) => `<link rel="preload" href="/fonts/${file}" as="font" type="font/woff2" crossorigin>`,
  ).join("\n");
  return `${preload}\n<style>${fontFaceCSS()}</style>`;
}

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

  // Client island bundles first, so pages can report the JS they actually ship.
  const islandKb = await buildIslands();

  const FONT_HEAD = fontHead(); // same for every page

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

    // Pages with an island lazy-load the boot script (the only JS any page ships).
    const hasIsland = body.includes("<is-land");
    const bootScript = hasIsland
      ? `\n<script type="module" src="/islands/boot.js"></script>`
      : "";

    // charset MUST be first (within the first 1024 bytes) — before the font block.
    let html = `<!doctype html>\n<html lang="en">\n<head>\n<meta charset="utf-8">\n${FONT_HEAD}\n${headHTML(meta)}\n</head>\n<body>\n${body}${bootScript}\n</body>\n</html>\n`;

    // Inject the honest build metrics. JS shipped is 0 for the static shell, or
    // the island bundle's real gzipped weight on pages that mount one.
    const jsKb = hasIsland ? islandKb : "0";
    const htmlKb = (gzipSync(Buffer.from(html)).length / 1024).toFixed(1);
    html = html
      .replaceAll(TOKENS.renderMs, renderMs)
      .replaceAll(TOKENS.jsBytes, jsKb)
      .replaceAll(TOKENS.htmlKb, htmlKb)
      .replaceAll(TOKENS.pimasVer, pimasVersion)
      .replaceAll(TOKENS.builtAt, new Date().toISOString().slice(0, 10));

    const file = join(OUT, route.url === "/" ? "index.html" : `${route.url}index.html`);
    await mkdir(dirname(file), { recursive: true });
    await writeFile(file, html);
    console.log(`  ${route.url.padEnd(18)} ${htmlKb} KB gz · ${renderMs} ms · ${jsKb} KB JS`);
  }

  // Self-hosted fonts + generated/passthrough files.
  await copyFonts();
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
