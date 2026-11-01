---
applies_to:
  - ".github/workflows/**"
  - "site/build.mjs"
  - "site/package.json"
---
## The live site is built by CI and never committed

`.github/workflows/deploy.yml` builds `site/` on every push to `main` and uploads `dist/` straight to Pages, so nothing generated belongs in git: never commit rendered HTML, islands, fonts or `sitemap.xml` to the root, and never add back a promote step.
