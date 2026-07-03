/**
 * The azulejo "rosette" net - the recurring tilework motif. The original pasted
 * the same <pattern> and fill rects across pages; here the pattern is defined
 * once (AzulejoDefs, rendered in the Shell) and referenced by url(#rosette).
 */

/**
 * The pattern definitions. Render exactly once per document (Shell does this).
 * Two motifs from the design language: the rosette net, and the Gothic
 * quatrefoil tracery used behind the footer.
 */
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
        <pattern id="quatrefoil" width="48" height="48" patternUnits="userSpaceOnUse">
          <g fill="none" stroke="var(--ocean)" stroke-width="1.15">
            <circle cx="24" cy="11" r="13" />
            <circle cx="37" cy="24" r="13" />
            <circle cx="24" cy="37" r="13" />
            <circle cx="11" cy="24" r="13" />
            <circle cx="0" cy="0" r="13" />
            <circle cx="48" cy="0" r="13" />
            <circle cx="0" cy="48" r="13" />
            <circle cx="48" cy="48" r="13" />
            <circle cx="24" cy="24" r="4.5" />
            <rect x="14.7" y="14.7" width="18.6" height="18.6" transform="rotate(45 24 24)" />
          </g>
        </pattern>
      </defs>
    </svg>
  );
}

/**
 * A horizontal band filled with a tile motif - used in footers and card
 * headers. `pattern` selects which motif ("rosette" or "quatrefoil").
 */
export function AzulejoBand(props: { height?: number; opacity?: number; pattern?: string }) {
  const h = props.height ?? 120;
  const o = props.opacity ?? 0.28;
  const pattern = props.pattern ?? "rosette";
  return (
    <svg
      width="100%"
      height={h}
      preserveAspectRatio="xMidYMid slice"
      style={`position:absolute; inset:0; opacity:${o}; pointer-events:none;`}
      aria-hidden="true"
    >
      <rect width="100%" height={h} fill={`url(#${pattern})`} />
    </svg>
  );
}
