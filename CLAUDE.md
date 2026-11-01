# noahhyden.com - operating rules

Personal site for Noah Hyden. Authored in [pimas](https://github.com/noahhyden/pimas)
and prerendered to static, zero-JavaScript HTML. Source of truth is `site/src/`;
`site/build.mjs` renders it to `dist/`, which CI uploads to GitHub Pages. No
build output is committed.

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
- **The landing page never speaks negatively of Noah or his work.** No
  self-deprecation, no apology, no hedging, no "just a", no undercutting a
  project while describing it. The register is factual and a little above
  neutral; positive where positive is true. Equally binding in the other
  direction: do not exaggerate, do not inflate scope, do not claim a result that
  has not happened. If the honest sentence would come out negative, cut the
  sentence instead of softening it.

## Rules

Explanation in code is capped at ONE line; the rest belongs in `AGENTS.d/`,
one rule per file, each a single line of at most 255 characters.
`site/scripts/check-comments.mjs` enforces it and runs on every `npm run
build` (as `prebuild`); it fails any multi-line block comment or run of
consecutive `//` lines, and there is no baseline.
`site/scripts/check-rules.mjs` runs beside it and holds the rules
themselves to the same cap: one body line of at most 255 characters, every
`applies_to:` pathspec matching a real file, and every rule listed below.
Neither guard may pass over an empty file list.

  - [`020-a-rule-is-one-line-of-255-characters.md`](AGENTS.d/020-a-rule-is-one-line-of-255-characters.md) - A rule is one line of 255 characters
  - [`030-shapes-a-comment-sweep-must-not-touch.md`](AGENTS.d/030-shapes-a-comment-sweep-must-not-touch.md) - Three shapes a one-line-comment sweep must not touch
  - [`120-island-modules-are-pure.md`](AGENTS.d/120-island-modules-are-pure.md) - Island modules are pure
  - [`121-graph-highlights-come-from-real-ledgers.md`](AGENTS.d/121-graph-highlights-come-from-real-ledgers.md) - Graph highlights come from real recompute ledgers
  - [`140-the-metrics-band-reports-only-defensible-numbers.md`](AGENTS.d/140-the-metrics-band-reports-only-defensible-numbers.md) - The metrics band reports only defensible numbers
  - [`141-azulejo-pattern-defined-once-per-document.md`](AGENTS.d/141-azulejo-pattern-defined-once-per-document.md) - Azulejo pattern is defined once per document
  - [`150-upstream-copy-is-sanitized-for-typography.md`](AGENTS.d/150-upstream-copy-is-sanitized-for-typography.md) - Upstream copy is sanitized for typography
  - [`151-the-live-site-is-built-by-ci-never-committed.md`](AGENTS.d/151-the-live-site-is-built-by-ci-never-committed.md) - The live site is built by CI and never committed

## Build & deploy

```sh
cd site
npm install
npm run build          # esbuild -> pimas/server renderToString -> ../dist/*.html
```

Deploys are automatic. `.github/workflows/deploy.yml` runs on every push to
`main` (and on `workflow_dispatch`), builds `site/`, and uploads `dist/` to
GitHub Pages with `actions/deploy-pages`. The Pages source is **GitHub
Actions**, not a branch, so `dist/` is gitignored and nothing generated is ever
committed; a build is a local preview only. Routes are the `ROUTES` table in
`build.mjs`; `sitemap.xml` falls out of it.

The build fetches the GitHub API for `/projects/` and `/papers/`. A failed fetch
fails the build rather than publishing an empty page. The workflow sets
`GH_BUILD_TOKEN` from the job's `GITHUB_TOKEN`, so the unauthenticated rate
limit is not in play; the build reads only `GH_BUILD_TOKEN`, so a stray ambient
token cannot break it.

## Git

Commit or push only when asked.
