/**
 * The azulejo "rosette" net — the recurring tilework motif. The original pasted
 * the same <pattern> and fill rects across pages; here the pattern is defined
 * once (AzulejoDefs, rendered in the Shell) and referenced by url(#rosette).
 */

/** The pattern definition. Render exactly once per document (Shell does this). */
export function AzulejoDefs() {
  return (
    <svg width="0" height="0" style="position:absolute;" aria-hidden="true">
      <defs>
        <pattern id="rosette" width="48" height="48" patternUnits="userSpaceOnUse">
          <g fill="none" stroke="var(--ocean)" stroke-width="1">
            <circle cx="0" cy="0" r="24" />
            <circle cx="48" cy="0" r="24" />
            <circle cx="0" cy="48" r="24" />
            <circle cx="48" cy="48" r="24" />
            <circle cx="24" cy="24" r="24" />
            <circle cx="24" cy="0" r="24" />
            <circle cx="24" cy="48" r="24" />
            <circle cx="0" cy="24" r="24" />
            <circle cx="48" cy="24" r="24" />
          </g>
        </pattern>
      </defs>
    </svg>
  );
}

/** A horizontal band filled with the rosette — used in footers and card headers. */
export function AzulejoBand(props: { height?: number; opacity?: number }) {
  const h = props.height ?? 120;
  const o = props.opacity ?? 0.28;
  return (
    <svg
      width="100%"
      height={h}
      preserveAspectRatio="xMidYMid slice"
      style={`position:absolute; inset:0; opacity:${o}; pointer-events:none;`}
      aria-hidden="true"
    >
      <rect width="100%" height={h} fill="url(#rosette)" />
    </svg>
  );
}
