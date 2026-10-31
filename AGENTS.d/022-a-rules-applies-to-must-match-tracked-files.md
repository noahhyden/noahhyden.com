---
applies_to:
  - "AGENTS.d/**"
  - "site/scripts/check-rules.mjs"
---
## A rule's applies_to must match tracked files

Every pathspec in a rule's `applies_to:` frontmatter must match at least one tracked file, so a rule whose code was deleted fails the build instead of rotting in always-loaded context.
