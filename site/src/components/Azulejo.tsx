
/** Pattern definitions; render once per document (see AGENTS.d/141-azulejo-pattern-defined-once-per-document.md). */
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

/** A horizontal band filled with a tile motif ("rosette" or "quatrefoil"). */
export function AzulejoBand(props: { height?: number; opacity?: number; pattern?: string }) {
  const h = props.height ?? 120;
  const o = props.opacity ?? 0.28;
  const pattern = props.pattern ?? "rosette";
  return (
    <svg
      width="100%"
      height={h}
      preserveAspectRatio="xMidYMid slice"
      style={`position:absolute; inset:0; opacity:${o}; pointer-events:none; -webkit-mask-image:linear-gradient(to bottom, #000 40%, transparent); mask-image:linear-gradient(to bottom, #000 40%, transparent);`}
      aria-hidden="true"
    >
      <rect width="100%" height={h} fill={`url(#${pattern})`} />
    </svg>
  );
}

/** Tracery opacity for every full-bleed field; the one place to retune. */
const FIELD_OPACITY = 0.16;

/** Full-bleed tracery field for a position:relative, isolated band; true tile scale, faded at top and bottom edges. */
export function AzulejoField(props: { id: string; pattern: "quatrefoil" | "rosette" }) {
  return (
    <svg width="100%" height="100%" style={`position:absolute; inset:0; z-index:-1; opacity:${FIELD_OPACITY}; pointer-events:none;`} aria-hidden="true">
      <defs>
        <linearGradient id={`fade-${props.id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#fff" stop-opacity="0" />
          <stop offset="12%" stop-color="#fff" stop-opacity="1" />
          <stop offset="88%" stop-color="#fff" stop-opacity="1" />
          <stop offset="100%" stop-color="#fff" stop-opacity="0" />
        </linearGradient>
        <mask id={`fademask-${props.id}`}>
          <rect width="100%" height="100%" fill={`url(#fade-${props.id})`} />
        </mask>
      </defs>
      <rect width="100%" height="100%" fill={`url(#${props.pattern})`} mask={`url(#fademask-${props.id})`} />
    </svg>
  );
}
