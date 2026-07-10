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
  themeJs: "__BUILD_THEME_JS__",
} as const;

// Dark palette, single-sourced. Applied both by system preference (unless the
// visitor explicitly chose light) and by an explicit data-theme="dark" that the
// inline theme toggle sets - so a manual choice always wins over the OS setting.
// Accents are lifted from the raw Madeira values, which are too dark to read on
// a dark ground.
const DARK_TOKENS = `
    --ground:#12140f; --surface:#1b1e18; --line:#2c302a; --ink:#e5e4db;
    --laurel:#7fae8f; --ocean:#7fa0b6; --falu:#d67a72; --granite:#9a988c; --tile:#8595a0;
    --nav-bg:rgba(18,20,15,.86); --footer-tint:rgba(229,228,219,.03);`;

const BASE_CSS = `
:root{
  --ground:#e5e4db; --surface:#dbd9ce; --line:#ccc9bb; --ink:#171e1a;
  --laurel:#3b5b47; --ocean:#3b5669; --falu:#801818; --granite:#716f65; --tile:#6e7d87;
  --nav-bg:rgba(229,228,219,.86); --footer-tint:rgba(23,30,26,.025);
  --serif:'Spectral', Georgia, 'Times New Roman', serif;
  --sans:'IBM Plex Sans', system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif;
  --mono:'IBM Plex Mono', ui-monospace, SFMono-Regular, Menlo, monospace;
}
*{box-sizing:border-box;}
html{scroll-behavior:smooth;}
body{margin:0;background:var(--ground);color:var(--ink);font-family:var(--sans);min-height:100vh;}
a{color:inherit;text-decoration:none;}
::selection{background:var(--laurel);color:var(--ground);}
.lift{transition:border-color .18s ease, transform .18s ease;}
.lift:hover{border-color:var(--granite); transform:translateY(-2px);}
.btn{transition:filter .18s ease;}
.btn:hover{filter:brightness(.93);}
.ln{transition:color .15s ease;}
.ln:hover{color:var(--falu);}
a:focus-visible,button:focus-visible{outline:2px solid var(--laurel); outline-offset:2px; border-radius:2px;}
@media(max-width:720px){.about-grid{grid-template-columns:1fr !important; gap:40px !important;} .about-grid aside{position:static !important; top:auto !important;}}
@media (prefers-color-scheme:dark){
  :root:not([data-theme="light"]){${DARK_TOKENS}}
}
:root[data-theme="dark"]{${DARK_TOKENS}}
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
 * shared reset + tokens inline (zero extra requests). Fonts are self-hosted,
 * same-origin - `build.mjs` injects the preloads + @font-face block ahead of
 * this, so there are zero external requests.
 */
export function headHTML(meta: PageMeta): string {
  const url = SITE + meta.path;
  // Home is just the name; inner pages get the suffix.
  const title = meta.path === "/" ? meta.title : `${meta.title} - Noah Hyden`;
  // NOTE: <meta charset> is emitted first by build.mjs, ahead of the font block,
  // so it stays within the first 1024 bytes. Don't add it here.
  return [
    `<meta name="viewport" content="width=device-width, initial-scale=1">`,
    `<link rel="icon" href="data:image/svg+xml,%3Csvg%20xmlns='http://www.w3.org/2000/svg'%20viewBox='0%200%2032%2032'%3E%3Crect%20width='32'%20height='32'%20rx='6'%20fill='%233b5b47'/%3E%3Ccircle%20cx='16'%20cy='16'%20r='5'%20fill='%23801818'/%3E%3C/svg%3E">`,
    `<title>${title}</title>`,
    `<meta name="description" content="${esc(meta.description)}">`,
    `<link rel="canonical" href="${url}">`,
    `<meta property="og:type" content="website">`,
    `<meta property="og:title" content="${esc(meta.title)}">`,
    `<meta property="og:description" content="${esc(meta.description)}">`,
    `<meta property="og:url" content="${url}">`,
    `<meta name="twitter:card" content="summary">`,
    `<style>${BASE_CSS}</style>`,
  ].join("\n");
}

function esc(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");
}
