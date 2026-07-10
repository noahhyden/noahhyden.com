# noahhyden.com

Source for [noahhyden.com](https://noahhyden.com) - a personal site for Noah
Hyden, authored in [pimas](https://github.com/noahhyden/pimas) (a from-scratch
reactive UI framework, published to npm as `pimas-ui`) and prerendered to
static, zero-JavaScript HTML.

The source of truth is `site/src/`. `site/build.mjs` renders it to `dist/`, and
`dist/` is promoted (copied) to the repo-root HTML files that GitHub Pages
serves.

## Properties

- **Zero JavaScript by default.** Pages are rendered to HTML in Node at build
  time via `pimas-ui/server`'s string backend. The static shell ships 0 KB of
  script.
- **Zero external requests at runtime.** Fonts are self-hosted (vendored from
  Fontsource, woff2 only), and GitHub data is fetched at build time, not in the
  browser. Nothing on a served page reaches a third-party origin.
- **Interactive islands ship JS only where used.** The few interactive
  components (`src/islands/`) are built as their own lazy-loaded client bundles;
  only a page that mounts an island loads any script, and then only that page.

## Build

```sh
cd site
npm install            # links the local pimas-ui package (file:../../pimas)
npm run build          # esbuild -> pimas-ui/server renderToString -> ../dist/*.html
```

`site/build.mjs` is the whole pipeline - no Vite, no meta-framework. For each
route it esbuilds the page's `.tsx` for Node (keeping `pimas-ui` external so
there is exactly one reactive kernel instance), renders it to a string, wraps it
in a `<head>` built from the page's `meta` export, and writes one `index.html`
per route. It then builds the island client bundles, copies the self-hosted
fonts, and emits `sitemap.xml`, `robots.txt`, `.nojekyll`, and `CNAME`.

## Routes

Routes are the `ROUTES` table in `site/build.mjs`; `sitemap.xml` falls out of it.
Each route writes an `index.html` in its own directory, so it serves at a clean,
extensionless URL.

| Route | Page source |
| --- | --- |
| `/` | `src/pages/index.tsx` |
| `/projects/` | `src/pages/projects.tsx` (repos pulled from the GitHub API at build time) |
| `/papers/` | `src/pages/papers.tsx` |
| `/pimas/` | `src/pages/pimas.tsx` |
| `/design-language/` | `src/pages/design-language.tsx` (design-system reference) |

## Layout

```
site/
  build.mjs            the whole build (route loop, islands, fonts, sitemap)
  package.json         build/serve scripts; pimas-ui + fonts as deps
  src/
    design.ts          colour/type tokens, base CSS, <head> builder, metric sentinels
    components/        Shell, Nav, Footer, Azulejo, icons
    pages/             one .tsx per route (export default + `export const meta`)
    islands/           interactive components shipped as lazy client bundles
```

Build output lands in `site/dist/` (gitignored).

## Deploy

The live site is served from the **repo-root** HTML files via GitHub Pages
(served from the repo root, with `CNAME` + `.nojekyll`). To deploy, run the
build and copy `site/dist/*` to the repo root.

## Conventions

- No em-dashes and no emoji anywhere in source or copy - see `CLAUDE.md`.
- Write plainly; do not invent biographical facts, posts, papers, or
  credentials.
</content>
</invoke>
