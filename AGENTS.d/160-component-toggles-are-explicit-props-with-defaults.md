---
applies_to:
  - "site/src/components/primitives.tsx"
---
## A component's toggles are explicit props with defaults

Every visual switch on a shared component is a named prop resolved in the body as `props.x ?? default`, never an implicit branch on undefined or a value baked into one variant name, so a call site reads as its complete configuration.
