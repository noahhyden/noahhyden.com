# noahhyden.com — pimas source

The site, authored in [pimas](https://github.com/noahhyden/pimas) and prerendered
to **static, zero-JavaScript HTML**. This replaces the old Claude design-canvas
runtime (`/support.js` + React/Babel from a CDN).

## How it works

```sh
npm install          # links the real pimas package (file:../../pimas)
npm run build        # esbuild → pimas/server renderToString → ../dist/*.html
```

`build.mjs` is the whole pipeline (~110 lines, no Vite, no meta-framework):

1. esbuild compiles each `src/pages/*.tsx` for Node (`jsxImportSource: pimas`),
   keeping **pimas external** so there is exactly one reactive kernel instance
   shared with the renderer (bundling it would inline a second engine copy — the
   dual-kernel hazard — and the page's `h()` and `renderToString()` would touch
   different backends).
2. Each page is rendered through `pimas/server`'s string backend in Node.
3. One `index.html` per route is written to `../dist/`, with `<head>` (title,
   canonical, OG) from the page's `meta` export and the honest build metrics
   injected into the footer.
4. `sitemap.xml`, `robots.txt`, `.nojekyll`, `CNAME`, and static assets are
   emitted/copied.

## Honest footer metrics

The footer reports defensible, build-measured numbers as an anti-bloat incentive:
JavaScript actually shipped (0), gzipped HTML weight, prerender time, pimas
version, and the structural "no diff pass → no wasted re-renders" property.
Browser RAM is deliberately *not* reported (theater). External requests are
reported honestly — fonts are the one remaining external origin (Google Fonts),
slated for self-hosting to reach a true zero.

## Layout

```
src/
  design.ts            colour/type tokens, base CSS, <head> builder, metric sentinels
  components/          Shell, Nav, Footer, Azulejo (the rosette), icons
  pages/
    index.tsx          home  (export default + `export const meta`)
build.mjs              the build
```

Output goes to `../dist/` (gitignored until the deployment model is settled; the
live site is still served from the hand-built root files).
