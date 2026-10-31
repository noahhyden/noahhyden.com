---
applies_to:
  - "site/src/components/Azulejo.tsx"
  - "site/src/components/Shell.tsx"
---
## Azulejo pattern is defined once per document

Render AzulejoDefs exactly once per document (Shell does it) and reference the patterns by url(#id); duplicate pattern ids make fills resolve to the wrong definition.
