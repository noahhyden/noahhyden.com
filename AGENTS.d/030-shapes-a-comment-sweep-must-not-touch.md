## Three shapes a one-line-comment sweep must not touch

Leave `//` inside string and regex literals, column-aligned trailing comments on code lines, and pragmas (`@ts-expect-error`, `eslint-disable`, SPDX and licence headers) alone; grep `PRAGMAS` in `site/scripts/check-comments.mjs` for the full list.
