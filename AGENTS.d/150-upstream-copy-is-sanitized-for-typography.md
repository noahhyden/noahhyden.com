---
applies_to:
  - "site/src/pages/index.tsx"
---
## Upstream copy is sanitized for typography

Text fetched at build time from GitHub or the von-neumann repo is third-party copy: fold em-dashes and LaTeX `--` to a plain hyphen before it renders, or an upstream edit silently breaches the repo's typography rule.
