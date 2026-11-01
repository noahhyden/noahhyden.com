/** The design system tokens and base reset, single-sourced and lifted to :root. */

/** Build-time metric sentinels. `build.mjs` replaces these in the final HTML. */
export const TOKENS = {
  jsBytes: "__BUILD_JS_BYTES__",
  htmlKb: "__BUILD_HTML_KB__",
  themeJs: "__BUILD_THEME_JS__",
} as const;

// Dark palette, applied by system preference and by data-theme="dark"; a manual choice wins.
const DARK_TOKENS = `
    --ground:#12140f; --surface:#1b1e18; --line:#2c302a; --ink:#e5e4db;
    --laurel:#7fae8f; --ocean:#7fa0b6; --falu:#d67a72; --granite:#9a988c; --tile:#8595a0;
    --nav-bg:rgba(18,20,15,.86); --footer-tint:rgba(229,228,219,.03);`;

const BASE_CSS = `
:root{
  --ground:#e5e4db; --surface:#dbd9ce; --line:#ccc9bb; --ink:#171e1a;
  --laurel:#3b5b47; --ocean:#3b5669; --falu:#801818; --granite:#5f5d53; --tile:#6e7d87;
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

/** The full <head> for a page; build.mjs injects font preloads and @font-face ahead of it. */
export function headHTML(meta: PageMeta): string {
  const url = SITE + meta.path;
  const title = meta.path === "/" ? meta.title : `${meta.title} - Noah Hyden`;
  // <meta charset> is emitted first by build.mjs to stay within the first 1024 bytes; don't add it here.
  return [
    `<meta name="viewport" content="width=device-width, initial-scale=1">`,
    `<link rel="icon" href="data:image/svg+xml,%3Csvg%20xmlns=%22http://www.w3.org/2000/svg%22%20viewBox=%220%200%20100%20100%22%3E%3Crect%20width=%22100%22%20height=%22100%22%20rx=%2216%22%20fill=%22%23e5e4db%22/%3E%3Cg%20fill=%22none%22%3E%3Ccircle%20cx=%2250%22%20cy=%2250%22%20r=%2242%22%20stroke=%22%233b5669%22%20stroke-width=%226%22/%3E%3Cg%20stroke=%22%233b5b47%22%20stroke-width=%225%22%3E%3Ccircle%20cx=%2250%22%20cy=%2231%22%20r=%2217%22/%3E%3Ccircle%20cx=%2250%22%20cy=%2269%22%20r=%2217%22/%3E%3Ccircle%20cx=%2231%22%20cy=%2250%22%20r=%2217%22/%3E%3Ccircle%20cx=%2269%22%20cy=%2250%22%20r=%2217%22/%3E%3C/g%3E%3C/g%3E%3Ccircle%20cx=%2250%22%20cy=%2250%22%20r=%227.5%22%20fill=%22%23801818%22/%3E%3C/svg%3E">`,
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
