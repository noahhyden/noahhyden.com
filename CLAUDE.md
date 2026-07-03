# noahhyden.com - operating rules

Personal site for Noah Hyden. Authored in [pimas](https://github.com/noahhyden/pimas)
and prerendered to static, zero-JavaScript HTML. Source of truth is `site/src/`;
`site/build.mjs` renders it to `dist/`, which is promoted to the repo-root HTML
files that GitHub Pages serves.

## Typography rules (binding)

- **No em-dashes.** The em-dash character (U+2014, `—`) and the `&mdash;` HTML
  entity are banned everywhere - source, copy, comments, commit messages. Use a
  plain ASCII hyphen (`-`) instead. An en-dash (U+2013) is fine for numeric
  ranges (e.g. `27-36`); prefer `&ndash;` or a hyphen.
- **No emojis.** No pictographic emoji or decorative dingbats in source or copy.
  Functional arrow glyphs already in the design system (`&rarr;` etc.) are fine.
- When editing, clean up any em-dash or emoji you come across, not just the ones
  you add.

## Copy

- Write plainly. No purple prose, no metaphor-as-personality, no AI-flavored
  aphorisms. Say what is true in the fewest honest words.
- Do not invent biographical facts, posts, papers, or credentials. If real
  content is missing, leave a marked gap and ask - never fabricate a placeholder
  that reads as real.

## Build & deploy

```sh
cd site
npm install
npm run build          # esbuild -> pimas/server renderToString -> ../dist/*.html
```

The live site is served from the **repo-root** HTML files (GitHub Pages, root,
with `CNAME` + `.nojekyll`). `dist/` is gitignored; promote a build by copying
`dist/*` to the repo root. Routes are the `ROUTES` table in `build.mjs`;
`sitemap.xml` falls out of it.

## Git

Commit or push only when asked.
