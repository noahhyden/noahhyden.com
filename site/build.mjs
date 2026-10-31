/** Build: esbuild each page, render via pimas/server, write one static HTML file per route. */
import { build as esbuild } from "esbuild";
import { gzipSync } from "node:zlib";
import { mkdir, writeFile, rm, readFile, readdir, cp } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { performance } from "node:perf_hooks";
import { createRequire } from "node:module";
import { pathToFileURL } from "node:url";

const ROOT = import.meta.dirname;
const OUT = resolve(ROOT, "../dist");
const CACHE = resolve(ROOT, ".cache/pages");
const require = createRequire(import.meta.url);

// The route table is just data - sitemap, etc. fall out of it.
const ROUTES = [
  { url: "/", page: "index" },
  { url: "/projects/", page: "projects" },
  { url: "/papers/", page: "papers" },
  { url: "/pimas/", page: "pimas" },
];

const pimasVersion = require("pimas-ui/package.json").version || "0.0.0";

// Islands: lazy client bundles; keep each slug in sync with the `<Island slug=...>` in a page.
const ISLAND_BOOT = "src/islands/boot.ts";
const ISLANDS = [
  { slug: "agent-sim", entry: "src/islands/agent-sim.tsx" },
];

// One split bundle set so boot and islands share ONE pimas kernel; returns the gzipped JS total.
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
    jsxImportSource: "pimas-ui",
    minify: true,
    logLevel: "warning",
  });
  let bytes = 0;
  for (const f of await readdir(outdir)) {
    if (f.endsWith(".js")) bytes += gzipSync(await readFile(join(outdir, f))).length;
  }
  return (bytes / 1024).toFixed(1); // KB gz shipped by any island page
}

// Self-hosted woff2 (Fontsource, OFL), latin + latin-ext: keeps the site zero-external-request.
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
// Standard Fontsource unicode-ranges; latin-ext loads only when an accented glyph appears.
const UNICODE_RANGE = {
  latin: "U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+0304,U+0308,U+0329,U+2000-206F,U+2074,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD",
  "latin-ext": "U+0100-02BA,U+02BD-02C5,U+02C7-02CC,U+02CE-02D7,U+02DD-02FF,U+0304,U+0308,U+0329,U+1D00-1DBF,U+1E00-1E9F,U+1EF2-1EFF,U+2020,U+20A0-20AB,U+20AD-20C0,U+2113,U+2C60-2C7F,U+A720-A7FF",
};
// Preload only the above-the-fold faces: Spectral 500 headline and IBM Plex Sans 400 body.
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
  // Bundle for Node with automatic JSX -> pimas; no DOM backend is pulled in.
  await esbuild({
    entryPoints: [resolve(ROOT, `src/pages/${page}.tsx`)],
    outfile: join(CACHE, `${page}.mjs`),
    bundle: true,
    format: "esm",
    platform: "node",
    jsx: "automatic",
    jsxImportSource: "pimas-ui",
    // Keep pimas EXTERNAL: bundling it makes a second kernel (dual-kernel hazard).
    external: ["pimas-ui", "pimas-ui/*"],
    logLevel: "warning",
  });
  return import(pathToFileURL(join(CACHE, `${page}.mjs`)).href + `?t=${process.hrtime.bigint()}`);
}

// The only script a page ships: inline theme toggle in <head>, sets data-theme before first paint.
const THEME_JS =
  `(function(){try{var t=localStorage.getItem('theme');if(t==='dark'||t==='light')document.documentElement.setAttribute('data-theme',t)}catch(e){}` +
  `document.addEventListener('DOMContentLoaded',function(){var b=document.getElementById('theme-toggle');if(!b)return;` +
  `b.addEventListener('click',function(){var c=document.documentElement.getAttribute('data-theme');` +
  `if(!c)c=matchMedia('(prefers-color-scheme:dark)').matches?'dark':'light';var n=c==='dark'?'light':'dark';` +
  `document.documentElement.setAttribute('data-theme',n);try{localStorage.setItem('theme',n)}catch(e){}})})})();`;
const THEME_SCRIPT = `<script>${THEME_JS}</script>`;
const THEME_KB = (Buffer.byteLength(THEME_JS) / 1024).toFixed(1);

function sitemap(routes) {
  const urls = routes
    .map((r) => `  <url><loc>https://noahhyden.com${r.url}</loc></url>`)
    .join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.w3.org/www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;
}

async function main() {
  const { renderToString } = await import("pimas-ui/server");

  // headHTML/TOKENS are build-only, so compile design.ts separately and import it.
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

    // Pages may prerender data (e.g. GitHub fetch) at build time; no runtime requests.
    const data = mod.getData ? await mod.getData() : {};

    const t0 = performance.now();
    const body = renderToString(() => Page(data));
    const renderMs = (performance.now() - t0).toFixed(2);

    // Pages with an island lazy-load the boot script (the only JS any page ships).
    const hasIsland = body.includes("<is-land");
    const bootScript = hasIsland
      ? `\n<script type="module" src="/islands/boot.js"></script>`
      : "";

    // charset MUST be first (within the first 1024 bytes) - before the font block.
    let html = `<!doctype html>\n<html lang="en">\n<head>\n<meta charset="utf-8">\n${THEME_SCRIPT}\n${FONT_HEAD}\n${headHTML(meta)}\n</head>\n<body>\n${body}${bootScript}\n</body>\n</html>\n`;

    // Inject build metrics: JS shipped is 0 for the static shell, else the island bundle's gzip size.
    const jsKb = hasIsland ? islandKb : "0";
    const htmlKb = (gzipSync(Buffer.from(html)).length / 1024).toFixed(1);
    html = html
      .replaceAll(TOKENS.renderMs, renderMs)
      .replaceAll(TOKENS.jsBytes, jsKb)
      .replaceAll(TOKENS.htmlKb, htmlKb)
      .replaceAll(TOKENS.pimasVer, pimasVersion)
      .replaceAll(TOKENS.themeJs, THEME_KB);

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

  console.log(`\nbuilt ${ROUTES.length} route(s) -> dist/  (pimas v${pimasVersion}, 0 KB JS shipped)`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
