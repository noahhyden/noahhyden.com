---
applies_to:
  - "site/src/**"
  - "site/build.mjs"
  - "site/scripts/**"
---
## Explanation in code is capped at ONE line; the rest belongs in AGENTS.d

`site/scripts/check-comments.mjs` fails any multi-line block comment or run of consecutive `//` lines; a reason that needs a paragraph is a rule, so write it as one AGENTS.d file and cite that file from the single line left behind.
