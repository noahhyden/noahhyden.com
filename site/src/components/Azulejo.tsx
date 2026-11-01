
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

/** Faint quatrefoil patch with a radial fade on every side; `pos` places it inside a position:relative section. */
export function AzulejoAccent(props: { id: string; pos: string }) {
  return (
    <svg width="360" height="360" style={`position:absolute; z-index:-1; max-width:100%; opacity:.3; pointer-events:none; ${props.pos}`} aria-hidden="true">
      <defs>
        <radialGradient id={`fade-${props.id}`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="#fff" stop-opacity="1" />
          <stop offset="100%" stop-color="#fff" stop-opacity="0" />
        </radialGradient>
        <mask id={`fademask-${props.id}`}>
          <rect width="100%" height="100%" fill={`url(#fade-${props.id})`} />
        </mask>
      </defs>
      <rect width="100%" height="100%" fill="url(#quatrefoil)" mask={`url(#fademask-${props.id})`} />
    </svg>
  );
}
