---
applies_to:
  - "site/scripts/**"
---
## A guard that scans nothing fails

A clean report over zero files is indistinguishable from a guard that never ran, so check-rules.mjs and check-comments.mjs exit 1 on an empty file list; a broken glob must fail loudly, never pass green.
