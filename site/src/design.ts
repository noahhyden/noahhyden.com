/**
 * The design system, in one place. The original site repeated this colour/type
 * token block (and a base reset) inline on every page; here it's a single source
 * of truth, lifted to :root so every component can reference var(--x).
 *
 * Palette + intent are unchanged from the hand-built site: Madeira basalt + the
 * laurel/ocean/falu azulejo accents, Spectral / IBM Plex type.
 */

/** Build-time metric sentinels. `build.mjs` replaces these in the final HTML. */
export const TOKENS = {
  renderMs: "__BUILD_RENDER_MS__",
  jsBytes: "__BUILD_JS_BYTES__",
  htmlKb: "__BUILD_HTML_KB__",
  pimasVer: "__BUILD_PIMAS_VER__",
  builtAt: "__BUILD_AT__",
} as const;

const BASE_CSS = `
:root{
  --ground:#e5e4db; --surface:#dbd9ce; --line:#ccc9bb; --ink:#171e1a;
  --laurel:#3b5b47; --ocean:#3b5669; --falu:#801818; --granite:#716f65; --tile:#6e7d87;
  --serif:'Spectral',serif; --sans:'IBM Plex Sans',sans-serif; --mono:'IBM Plex Mono',monospace;
}
*{box-sizing:border-box;}
html{scroll-behavior:smooth;}
body{margin:0;background:var(--ground);color:var(--ink);font-family:var(--sans);min-height:100vh;}
a{color:inherit;text-decoration:none;}
::selection{background:var(--laurel);color:var(--ground);}
`.trim();

const SITE = "https://noahhyden.com";

export interface PageMeta {
  /** Path with trailing slash, e.g. "/about/". Home is "/". */
  path: string;
  title: string;
  description: string;
}

/**
 * The full <head> for a page. Title/description/canonical/OG from `meta`; the
 * shared reset + tokens inline (zero extra requests); fonts from Google Fonts
 * (the one external origin — slated for self-hosting to reach a true zero).
 */
export function headHTML(meta: PageMeta): string {
  const url = SITE + meta.path;
  // Home is just the name; inner pages get the suffix.
  const title = meta.path === "/" ? meta.title : `${meta.title} — Noah Hyden`;
  return [
    `<meta charset="utf-8">`,
    `<meta name="viewport" content="width=device-width, initial-scale=1">`,
    `<title>${title}</title>`,
    `<meta name="description" content="${esc(meta.description)}">`,
    `<link rel="canonical" href="${url}">`,
    `<meta property="og:type" content="website">`,
    `<meta property="og:title" content="${esc(meta.title)}">`,
    `<meta property="og:description" content="${esc(meta.description)}">`,
    `<meta property="og:url" content="${url}">`,
    `<meta name="twitter:card" content="summary">`,
    `<link rel="preconnect" href="https://fonts.googleapis.com">`,
    `<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>`,
    `<link href="https://fonts.googleapis.com/css2?family=Spectral:ital,wght@0,300;0,400;0,500;0,600;1,400;1,500&family=IBM+Plex+Sans:wght@400;500;600&family=IBM+Plex+Mono:wght@400;500&display=swap" rel="stylesheet">`,
    `<style>${BASE_CSS}</style>`,
  ].join("\n");
}

function esc(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");
}
