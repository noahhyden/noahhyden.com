/**
 * Design language — the foundations doc (palette, type scale, azulejo tilework,
 * buttons, icons, components). A standalone showcase: it keeps its own masthead
 * and footer rather than the site Shell, and defines its own three azulejo
 * patterns. Not in the nav. Ported faithfully from the hand-built page.
 */
import type { Child } from "pimas/dom";
import type { PageMeta } from "../design.js";

export const meta: PageMeta = {
  path: "/design-language/",
  title: "Design language",
  description: "The reconciled system — palette, type scale, azulejo tracery, buttons, icons, and components.",
};

const mono = "font-family:var(--mono);";
const sectionTop = "padding:52px 0; border-top:1px solid var(--line);";

function SectionHead(props: { title: string; note: string }) {
  return (
    <div style="display:flex; align-items:baseline; justify-content:space-between; margin:0 0 8px;">
      <h2 style="font-family:var(--serif); font-weight:600; font-size:25px; letter-spacing:-.01em; margin:0; color:var(--ink);">{props.title}</h2>
      <span style="font-family:var(--mono); font-size:11px; letter-spacing:.06em; color:var(--granite);">{props.note}</span>
    </div>
  );
}

function Swatch(props: { bg: string; name: string; role: string; roleColor?: string; hex: string; sub: string; border?: boolean }) {
  return (
    <div>
      <div style={`height:104px; border-radius:3px; background:${props.bg};${props.border ? " border:1px solid var(--line);" : ""}`} />
      <div style="display:flex; justify-content:space-between; align-items:baseline; margin-top:11px;">
        <span style="font-family:var(--serif); font-weight:600; font-size:15px;">{props.name}</span>
        <span style={`${mono} font-size:10px; letter-spacing:.08em; text-transform:uppercase; color:${props.roleColor ?? "var(--granite)"};`}>{props.role}</span>
      </div>
      <div style={`${mono} font-size:11px; color:var(--granite); margin-top:5px;`}>{props.hex}</div>
      <div style={`${mono} font-size:10px; color:var(--granite); opacity:.75; margin-top:2px;`}>{props.sub}</div>
    </div>
  );
}

function TypeRow(props: { label: Child; children: Child }) {
  return (
    <div style="display:grid; grid-template-columns:172px 1fr; gap:24px; align-items:baseline; padding:18px 0; border-top:1px solid var(--line);">
      <div style={`${mono} font-size:10.5px; line-height:1.6; color:var(--granite);`}>{props.label}</div>
      {props.children}
    </div>
  );
}

/** Standard 24px line-icon frame. */
function I(props: { children: Child }) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
      {props.children}
    </svg>
  );
}

function IconCell(props: { label: string; children: Child }) {
  return (
    <div style="aspect-ratio:1; border:1px solid var(--line); border-radius:3px; display:flex; flex-direction:column; align-items:center; justify-content:center; gap:8px; background:var(--ground);">
      {props.children}
      <span style={`${mono} font-size:9px; color:var(--granite);`}>{props.label}</span>
    </div>
  );
}

function CardHead(props: { children: Child }) {
  return <div style={`${mono} font-size:10px; letter-spacing:.12em; text-transform:uppercase; color:var(--granite); margin:0 0 16px;`}>{props.children}</div>;
}

export default function DesignLanguage() {
  return (
    <div style="--ground:#e5e4db; --surface:#dbd9ce; --line:#ccc9bb; --ink:#171e1a; --laurel:#3b5b47; --ocean:#3b5669; --falu:#801818; --granite:#716f65; --tile:#6e7d87; --tilefill:#dde0de; background:var(--ground); color:var(--ink); font-family:var(--sans); min-height:100vh; padding:64px 48px 96px;">
      <div style="max-width:1080px; margin:0 auto;">
        <header>
          <div style={`${mono} font-size:11px; letter-spacing:.22em; text-transform:uppercase; color:var(--granite); margin:0 0 18px;`}>Design language &nbsp;/&nbsp; Noah Hyden &nbsp;/&nbsp; foundations &nbsp;/&nbsp; v5</div>
          <h1 style="font-family:var(--serif); font-weight:500; font-size:49px; line-height:1.04; letter-spacing:-.022em; color:var(--ink); margin:0 0 18px; max-width:17ch;">Basalt, laurel, and one <span style="color:var(--falu);">Falun red</span>.</h1>
          <p style="font-family:var(--sans); font-size:16px; line-height:1.6; color:var(--granite); margin:0; max-width:64ch;">A single reconciled system. Madeira&rsquo;s rock and laurisilva, the cold North Atlantic, and one Swedish red mixed from Falun copper &mdash; set in a humanist serif over a precise grotesque, every measure on an 8&nbsp;px grid.</p>
        </header>

        {/* PALETTE */}
        <section style="padding:52px 0; border-top:1px solid var(--line); margin-top:48px;">
          <div style="display:flex; align-items:baseline; justify-content:space-between; margin:0 0 28px;">
            <h2 style="font-family:var(--serif); font-weight:600; font-size:25px; letter-spacing:-.01em; margin:0; color:var(--ink);">Palette</h2>
            <span style={`${mono} font-size:11px; letter-spacing:.06em; color:var(--granite);`}>6 colors &middot; tuned so Falur&ouml;d leads</span>
          </div>
          <div style="display:grid; grid-template-columns:repeat(6,1fr); gap:14px;">
            <Swatch bg="var(--ink)" name="Basalt" role="ink" hex="#171E1A" sub=".22 .012 165" />
            <Swatch bg="var(--laurel)" name="Laurisilva" role="primary" hex="#3B5B47" sub=".44 .050 156" />
            <Swatch bg="var(--ocean)" name="Ocean" role="secondary" hex="#3B5669" sub=".44 .045 238" />
            <Swatch bg="var(--falu)" name="Falur&ouml;d" role="accent" roleColor="var(--falu)" hex="#801818" sub="locked &middot; SE" />
            <Swatch bg="var(--granite)" name="Granite" role="muted" hex="#716F65" sub=".54 .016 100" />
            <Swatch bg="var(--ground)" name="Limewash" role="ground" hex="#E5E4DB" sub=".92 .012 101" border />
          </div>
          <div style="display:grid; grid-template-columns:1.5fr 1fr; gap:40px; margin-top:32px; align-items:start;">
            <p style="font-family:var(--sans); font-size:14px; line-height:1.6; color:var(--granite); margin:0;">Falur&ouml;d is fixed at its real pigment value &mdash; <span style="color:var(--falu);">#801818</span>, the iron-oxide red of Falun. Laurisilva and Ocean are <span style="color:var(--ink);">held to one another</span> &mdash; matched in lightness and low in chroma (L&nbsp;&asymp;&nbsp;0.44) &mdash; so the green and steel-blue read as one calm pair and the red is left to carry attention. Basalt anchors below; Granite and Limewash share a warm near-neutral axis.</p>
            <div>
              <div style={`${mono} font-size:10px; letter-spacing:.12em; text-transform:uppercase; color:var(--granite); margin:0 0 12px;`}>Derived neutrals</div>
              <div style="display:flex; border:1px solid var(--line); border-radius:3px; overflow:hidden;">
                <div style="flex:1; height:44px; background:var(--ground);" />
                <div style="flex:1; height:44px; background:var(--surface);" />
                <div style="flex:1; height:44px; background:var(--line);" />
                <div style="flex:1; height:44px; background:var(--granite);" />
                <div style="flex:1; height:44px; background:var(--ink);" />
              </div>
              <div style={`${mono} font-size:10px; color:var(--granite); margin-top:8px; line-height:1.6;`}>ground &middot; surface #DBD9CE &middot; line #CCC9BB &middot; granite &middot; ink</div>
            </div>
          </div>
        </section>

        {/* TYPOGRAPHY */}
        <section style={sectionTop}>
          <SectionHead title="Typography" note="Spectral · IBM Plex Sans · IBM Plex Mono" />
          <p style="font-family:var(--sans); font-size:14px; line-height:1.6; color:var(--granite); margin:0 0 30px; max-width:64ch;">One modular scale: base <span style="color:var(--ink);">16&nbsp;px</span>, ratio <span style="color:var(--ink);">1.25</span> (the 5:4 major third). Every size is 16&nbsp;&times;&nbsp;1.25&#8319; &mdash; nothing chosen by eye.</p>
          <div style="display:grid; gap:0;">
            <TypeRow label={<span>Display &middot; n5<br />Spectral 500 &middot; 49px</span>}>
              <div style="font-family:var(--serif); font-weight:500; font-size:49px; line-height:1.0; letter-spacing:-.022em;">Hewn from basalt</div>
            </TypeRow>
            <TypeRow label={<span>Heading &middot; n3<br />Spectral 600 &middot; 31px</span>}>
              <div style="font-family:var(--serif); font-weight:600; font-size:31px; line-height:1.12; letter-spacing:-.015em;">Selected work</div>
            </TypeRow>
            <TypeRow label={<span>Title &middot; n2<br />Spectral 600 &middot; 25px</span>}>
              <div style="font-family:var(--serif); font-weight:600; font-size:25px; line-height:1.18; letter-spacing:-.012em;">A unit of the grid</div>
            </TypeRow>
            <TypeRow label={<span>Lead &middot; n1<br />Plex Sans 400 &middot; 20px</span>}>
              <div style="font-family:var(--sans); font-weight:400; font-size:20px; line-height:1.45; color:var(--ink);">The standfirst sits one step above body.</div>
            </TypeRow>
            <TypeRow label={<span>Body &middot; n0<br />Plex Sans 400 &middot; 16px</span>}>
              <p style="font-family:var(--sans); font-size:16px; line-height:1.6; color:var(--ink); margin:0; max-width:62ch;">Volcanic rock and limewashed plaster, the deep green of the laurisilva, the cold blue of the Atlantic &mdash; and against all of it, <span style="font-family:var(--serif); font-style:italic;">one steady red</span>. The body holds a calm grotesque so the serif can speak.</p>
            </TypeRow>
            <TypeRow label={<span>Small / Eyebrow &middot; n-1<br />Plex Sans &middot; 13px</span>}>
              <div>
                <div style="font-family:var(--sans); font-weight:600; font-size:13px; letter-spacing:.14em; text-transform:uppercase; color:var(--laurel); margin-bottom:6px;">Scope of work</div>
                <p style="font-family:var(--sans); font-size:13px; line-height:1.55; color:var(--granite); margin:0;">Captions and metadata hold Granite, never pure black.</p>
              </div>
            </TypeRow>
            <div style="display:grid; grid-template-columns:172px 1fr; gap:24px; align-items:baseline; padding:18px 0; border-top:1px solid var(--line); border-bottom:1px solid var(--line);">
              <div style={`${mono} font-size:10.5px; line-height:1.6; color:var(--granite);`}>Technical &middot; n-1<br />Plex Mono &middot; 13px</div>
              <div style={`${mono} font-size:13px; color:var(--laurel);`}>lat 32.7&deg; N &middot; lon 16.9&deg; W &middot; color/laurisilva &middot; grid/8</div>
            </div>
          </div>
        </section>

        {/* AZULEJO */}
        <section style={sectionTop}>
          <SectionHead title="Azulejo" note="tracery · seamless net" />
          <p style="font-family:var(--sans); font-size:14px; line-height:1.6; color:var(--granite); margin:0 0 26px; max-width:68ch;">Rebuilt as tracery. Each motif is drawn so its arcs run unbroken into the next tile &mdash; a continuous net rather than stamped units &mdash; drawn in ocean, the secondary blue, kept low in opacity so it sits behind the page, not on top of it. Compass-and-rule construction on the 8&nbsp;px grid, after the Gothic and the <span style="font-style:italic;">de tapete</span> azulejo. Three densities.</p>
          <div style="display:grid; grid-template-columns:repeat(3,1fr); gap:18px;">
            <div>
              <div style="height:188px; border-radius:3px; border:1px solid var(--line); background:var(--ground); overflow:hidden;">
                <svg width="100%" height="100%" viewBox="0 0 188 188" preserveAspectRatio="xMidYMid slice" style="display:block;">
                  <defs>
                    <pattern id="az-rosette" width="48" height="48" patternUnits="userSpaceOnUse">
                      <g fill="none" stroke="var(--ocean)" stroke-width="1.05">
                        <circle cx="0" cy="0" r="24" /><circle cx="48" cy="0" r="24" /><circle cx="0" cy="48" r="24" /><circle cx="48" cy="48" r="24" />
                        <circle cx="24" cy="24" r="24" />
                        <circle cx="24" cy="0" r="24" /><circle cx="24" cy="48" r="24" /><circle cx="0" cy="24" r="24" /><circle cx="48" cy="24" r="24" />
                      </g>
                      <g fill="var(--ocean)"><circle cx="0" cy="0" r="2" /><circle cx="48" cy="0" r="2" /><circle cx="0" cy="48" r="2" /><circle cx="48" cy="48" r="2" /><circle cx="24" cy="24" r="2" /></g>
                    </pattern>
                  </defs>
                  <rect width="100%" height="100%" fill="url(#az-rosette)" />
                </svg>
              </div>
              <div style={`${mono} font-size:10.5px; color:var(--granite); margin-top:9px;`}>rosette net &middot; r24 &middot; continuous petals</div>
            </div>
            <div>
              <div style="height:188px; border-radius:3px; border:1px solid var(--line); background:var(--ground); overflow:hidden;">
                <svg width="100%" height="100%" viewBox="0 0 188 188" preserveAspectRatio="xMidYMid slice" style="display:block;">
                  <defs>
                    <pattern id="az-quatre" width="48" height="48" patternUnits="userSpaceOnUse">
                      <g fill="none" stroke="var(--ocean)" stroke-width="1.15">
                        <circle cx="24" cy="11" r="13" /><circle cx="37" cy="24" r="13" /><circle cx="24" cy="37" r="13" /><circle cx="11" cy="24" r="13" />
                        <circle cx="0" cy="0" r="13" /><circle cx="48" cy="0" r="13" /><circle cx="0" cy="48" r="13" /><circle cx="48" cy="48" r="13" />
                        <circle cx="24" cy="24" r="4.5" />
                        <rect x="14.7" y="14.7" width="18.6" height="18.6" transform="rotate(45 24 24)" />
                      </g>
                    </pattern>
                  </defs>
                  <rect width="100%" height="100%" fill="url(#az-quatre)" />
                </svg>
              </div>
              <div style={`${mono} font-size:10.5px; color:var(--granite); margin-top:9px;`}>quatrefoil tracery &middot; Gothic &middot; 48px</div>
            </div>
            <div>
              <div style="height:188px; border-radius:3px; border:1px solid var(--line); background:var(--ground); overflow:hidden;">
                <svg width="100%" height="100%" viewBox="0 0 188 188" preserveAspectRatio="xMidYMid slice" style="display:block;">
                  <defs>
                    <pattern id="az-star" width="64" height="64" patternUnits="userSpaceOnUse">
                      <g fill="none" stroke="var(--ocean)" stroke-width="1.05">
                        <circle cx="32" cy="32" r="20" /><circle cx="32" cy="32" r="11" />
                        <circle cx="0" cy="0" r="20" /><circle cx="64" cy="0" r="20" /><circle cx="0" cy="64" r="20" /><circle cx="64" cy="64" r="20" />
                        <circle cx="0" cy="0" r="11" /><circle cx="64" cy="0" r="11" /><circle cx="0" cy="64" r="11" /><circle cx="64" cy="64" r="11" />
                        <path d="M32 12 L52 32 L32 52 L12 32 Z" />
                        <path d="M0 0 L20 0 M0 0 L0 20 M64 0 L44 0 M64 0 L64 20 M0 64 L20 64 M0 64 L0 44 M64 64 L44 64 M64 64 L64 44" />
                        <path d="M32 12 L32 -8 M32 52 L32 72 M12 32 L-8 32 M52 32 L72 32" />
                      </g>
                      <g fill="var(--tilefill)"><circle cx="32" cy="32" r="4" /></g>
                    </pattern>
                  </defs>
                  <rect width="100%" height="100%" fill="url(#az-star)" />
                </svg>
              </div>
              <div style={`${mono} font-size:10.5px; color:var(--granite); margin-top:9px;`}>star &amp; ring &middot; densest &middot; 64px</div>
            </div>
          </div>
        </section>

        {/* BUTTONS */}
        <section style={sectionTop}>
          <div style="display:flex; align-items:baseline; justify-content:space-between; margin:0 0 28px;">
            <h2 style="font-family:var(--serif); font-weight:600; font-size:25px; letter-spacing:-.01em; margin:0;">Buttons</h2>
            <span style={`${mono} font-size:11px; letter-spacing:.06em; color:var(--granite);`}>2px radius &middot; 8px rhythm</span>
          </div>
          <div style="display:flex; flex-direction:column; gap:26px;">
            <div>
              <CardHead>Hierarchy</CardHead>
              <div style="display:flex; flex-wrap:wrap; gap:14px; align-items:center;">
                <span style="display:inline-flex; align-items:center; gap:9px; font-family:var(--sans); font-weight:500; font-size:15px; padding:12px 20px; border-radius:2px; background:var(--laurel); color:var(--ground); border:1px solid var(--laurel); white-space:nowrap;">View the work <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><line x1="4" y1="12" x2="19" y2="12" /><polyline points="13,6 20,12 13,18" /></svg></span>
                <span style="display:inline-flex; align-items:center; gap:9px; font-family:var(--sans); font-weight:500; font-size:15px; padding:12px 20px; border-radius:2px; background:var(--ocean); color:var(--ground); border:1px solid var(--ocean); white-space:nowrap;">Secondary</span>
                <span style="display:inline-flex; align-items:center; gap:9px; font-family:var(--sans); font-weight:500; font-size:15px; padding:12px 20px; border-radius:2px; background:var(--falu); color:var(--ground); border:1px solid var(--falu); white-space:nowrap;">Book a call</span>
                <span style="display:inline-flex; align-items:center; gap:9px; font-family:var(--sans); font-weight:500; font-size:15px; padding:12px 20px; border-radius:2px; background:transparent; color:var(--ink); border:1px solid var(--granite); white-space:nowrap;">Ghost</span>
                <span style="display:inline-flex; align-items:center; gap:9px; font-family:var(--sans); font-weight:500; font-size:15px; padding:12px 20px; border-radius:2px; background:var(--surface); color:var(--ink); border:1px solid var(--surface); white-space:nowrap;">Quiet</span>
                <span style={`display:inline-flex; align-items:center; gap:7px; ${mono} font-size:13px; color:var(--falu); border-bottom:1px solid var(--falu); padding-bottom:2px;`}>text link &rarr;</span>
                <span style="display:inline-flex; align-items:center; gap:9px; font-family:var(--sans); font-weight:500; font-size:15px; padding:12px 20px; border-radius:2px; background:transparent; color:var(--granite); border:1px solid var(--line); white-space:nowrap;">Disabled</span>
              </div>
            </div>
            <div>
              <CardHead>Sizes &middot; 8 / 12 / 16 px padding</CardHead>
              <div style="display:flex; flex-wrap:wrap; gap:14px; align-items:center;">
                <span style="display:inline-flex; align-items:center; font-family:var(--sans); font-weight:500; font-size:13px; padding:8px 14px; border-radius:2px; background:var(--laurel); color:var(--ground);">Small</span>
                <span style="display:inline-flex; align-items:center; font-family:var(--sans); font-weight:500; font-size:15px; padding:12px 20px; border-radius:2px; background:var(--laurel); color:var(--ground);">Medium</span>
                <span style="display:inline-flex; align-items:center; font-family:var(--sans); font-weight:500; font-size:17px; padding:16px 28px; border-radius:2px; background:var(--laurel); color:var(--ground);">Large</span>
                <span style="display:inline-flex; align-items:center; justify-content:center; width:44px; height:44px; border-radius:2px; background:var(--laurel); color:var(--ground);"><svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg></span>
                <span style="display:inline-flex; align-items:center; justify-content:center; width:44px; height:44px; border-radius:2px; background:transparent; color:var(--ink); border:1px solid var(--granite);"><svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="6" /><line x1="15.5" y1="15.5" x2="20" y2="20" /></svg></span>
              </div>
            </div>
          </div>
        </section>

        {/* ICONOGRAPHY */}
        <section style={sectionTop}>
          <SectionHead title="Iconography" note="24px grid · 1.5px stroke · geometric" />
          <p style="font-family:var(--sans); font-size:14px; line-height:1.6; color:var(--granite); margin:0 0 26px; max-width:66ch;">A line set drawn from primitives &mdash; straight runs, right angles, and circles on the 24&nbsp;px box &mdash; to match the engineered grotesque. No flourishes.</p>
          <div style="display:grid; grid-template-columns:repeat(8,1fr); gap:12px; color:var(--ink);">
            <IconCell label="arrow"><I><line x1="4" y1="12" x2="20" y2="12" /><polyline points="13,5 20,12 13,19" /></I></IconCell>
            <IconCell label="external"><I><line x1="6" y1="18" x2="18" y2="6" /><polyline points="8,6 18,6 18,16" /></I></IconCell>
            <IconCell label="chevron"><I><polyline points="9,5 16,12 9,19" /></I></IconCell>
            <IconCell label="plus"><I><line x1="12" y1="4" x2="12" y2="20" /><line x1="4" y1="12" x2="20" y2="12" /></I></IconCell>
            <IconCell label="close"><I><line x1="6" y1="6" x2="18" y2="18" /><line x1="18" y1="6" x2="6" y2="18" /></I></IconCell>
            <IconCell label="check"><I><polyline points="4,12 10,18 20,6" /></I></IconCell>
            <IconCell label="search"><I><circle cx="11" cy="11" r="6" /><line x1="15.5" y1="15.5" x2="20" y2="20" /></I></IconCell>
            <IconCell label="mail"><I><rect x="3" y="6" width="18" height="12" rx="1" /><polyline points="3.5,7 12,13 20.5,7" /></I></IconCell>
            <IconCell label="download"><I><line x1="12" y1="4" x2="12" y2="15" /><polyline points="7,11 12,16 17,11" /><line x1="5" y1="20" x2="19" y2="20" /></I></IconCell>
            <IconCell label="menu"><I><line x1="4" y1="7" x2="20" y2="7" /><line x1="4" y1="12" x2="20" y2="12" /><line x1="4" y1="17" x2="20" y2="17" /></I></IconCell>
            <IconCell label="grid"><I><rect x="4" y="4" width="6.5" height="6.5" rx="1" /><rect x="13.5" y="4" width="6.5" height="6.5" rx="1" /><rect x="4" y="13.5" width="6.5" height="6.5" rx="1" /><rect x="13.5" y="13.5" width="6.5" height="6.5" rx="1" /></I></IconCell>
            <IconCell label="clock"><I><circle cx="12" cy="12" r="8" /><polyline points="12,7 12,12 16,14" /></I></IconCell>
            <IconCell label="calendar"><I><rect x="4" y="5" width="16" height="16" rx="1" /><line x1="4" y1="9" x2="20" y2="9" /><line x1="9" y1="3" x2="9" y2="7" /><line x1="15" y1="3" x2="15" y2="7" /></I></IconCell>
            <IconCell label="document"><I><path d="M6 3h8l4 4v14H6z" /><polyline points="14,3 14,7 18,7" /></I></IconCell>
            <IconCell label="circle"><I><circle cx="12" cy="12" r="8" /></I></IconCell>
            <IconCell label="diamond"><I><polygon points="12,2 18,12 12,22 6,12" /></I></IconCell>
          </div>
        </section>

        {/* COMPONENTS */}
        <section style="padding:52px 0 0; border-top:1px solid var(--line);">
          <div style="display:flex; align-items:baseline; justify-content:space-between; margin:0 0 28px;">
            <h2 style="font-family:var(--serif); font-weight:600; font-size:25px; letter-spacing:-.01em; margin:0;">Components</h2>
            <span style={`${mono} font-size:11px; letter-spacing:.06em; color:var(--granite);`}>a first pass &middot; many to react to</span>
          </div>
          <div style="display:grid; grid-template-columns:1fr 1fr; gap:20px;">
            <div style="border:1px solid var(--line); border-radius:3px; background:var(--ground); padding:22px;">
              <CardHead>Tags &amp; status</CardHead>
              <div style="display:flex; flex-wrap:wrap; gap:8px; margin-bottom:16px;">
                <span style={`${mono} font-size:11px; padding:4px 10px; border-radius:2px; background:var(--surface); color:var(--ink);`}>avionics</span>
                <span style={`${mono} font-size:11px; padding:4px 10px; border-radius:2px; border:1px solid var(--laurel); color:var(--laurel);`}>structures</span>
                <span style={`${mono} font-size:11px; padding:4px 10px; border-radius:2px; border:1px solid var(--ocean); color:var(--ocean);`}>propulsion</span>
              </div>
              <div style="display:flex; flex-wrap:wrap; gap:16px;">
                <span style="display:inline-flex; align-items:center; gap:7px; font-family:var(--sans); font-size:13px; color:var(--ink);"><span style="width:8px; height:8px; border-radius:50%; background:var(--laurel);" />Active</span>
                <span style="display:inline-flex; align-items:center; gap:7px; font-family:var(--sans); font-size:13px; color:var(--ink);"><span style="width:8px; height:8px; border-radius:50%; background:var(--granite);" />Archived</span>
                <span style="display:inline-flex; align-items:center; gap:7px; font-family:var(--sans); font-size:13px; color:var(--ink);"><span style="width:8px; height:8px; border-radius:50%; background:var(--falu);" />Blocked</span>
              </div>
            </div>

            <div style="border:1px solid var(--line); border-radius:3px; background:var(--ground); padding:22px;">
              <CardHead>Field</CardHead>
              <label style="display:block; font-family:var(--sans); font-weight:600; font-size:13px; color:var(--ink); margin-bottom:7px;">Email</label>
              <div style="display:flex; align-items:center; gap:9px; border:1px solid var(--granite); border-radius:2px; padding:10px 12px; background:var(--ground);">
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="var(--granite)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="6" width="18" height="12" rx="1" /><polyline points="3.5,7 12,13 20.5,7" /></svg>
                <span style="font-family:var(--sans); font-size:15px; color:var(--ink);">noah@</span><span style="width:1px; height:18px; background:var(--falu); display:inline-block;" />
              </div>
              <div style="font-family:var(--sans); font-size:12px; color:var(--granite); margin-top:7px;">Used only to send the call link.</div>
            </div>

            <div style="border:1px solid var(--line); border-radius:3px; background:var(--ground); padding:22px;">
              <CardHead>Selection</CardHead>
              <div style="display:flex; flex-direction:column; gap:13px;">
                <label style="display:flex; align-items:center; gap:11px; font-family:var(--sans); font-size:14px; color:var(--ink);"><span style="width:18px; height:18px; border-radius:2px; background:var(--laurel); display:inline-flex; align-items:center; justify-content:center;"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="var(--ground)" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><polyline points="4,12 10,18 20,6" /></svg></span>Checked</label>
                <label style="display:flex; align-items:center; gap:11px; font-family:var(--sans); font-size:14px; color:var(--granite);"><span style="width:18px; height:18px; border-radius:2px; border:1px solid var(--granite); display:inline-block;" />Unchecked</label>
                <label style="display:flex; align-items:center; gap:11px; font-family:var(--sans); font-size:14px; color:var(--ink);"><span style="width:18px; height:18px; border-radius:50%; border:1px solid var(--laurel); display:inline-flex; align-items:center; justify-content:center;"><span style="width:9px; height:9px; border-radius:50%; background:var(--laurel);" /></span>Radio on</label>
                <div style="display:flex; align-items:center; gap:11px;"><span style="width:38px; height:22px; border-radius:11px; background:var(--laurel); position:relative; display:inline-block;"><span style="position:absolute; top:3px; left:19px; width:16px; height:16px; border-radius:50%; background:var(--ground);" /></span><span style="font-family:var(--sans); font-size:14px; color:var(--ink);">Toggle</span></div>
              </div>
            </div>

            <div style="border:1px solid var(--line); border-radius:3px; background:var(--ground); padding:22px;">
              <CardHead>Tabs</CardHead>
              <div style="display:flex; gap:26px; border-bottom:1px solid var(--line); margin-bottom:16px;">
                <span style="font-family:var(--sans); font-weight:600; font-size:14px; color:var(--ink); padding-bottom:10px; border-bottom:2px solid var(--laurel); margin-bottom:-1px;">Overview</span>
                <span style="font-family:var(--sans); font-size:14px; color:var(--granite); padding-bottom:10px;">Method</span>
                <span style="font-family:var(--sans); font-size:14px; color:var(--granite); padding-bottom:10px;">Notes</span>
              </div>
              <div style={`${mono} font-size:10px; letter-spacing:.12em; text-transform:uppercase; color:var(--granite); margin:14px 0 12px;`}>Segmented</div>
              <div style="display:inline-flex; border:1px solid var(--line); border-radius:2px; overflow:hidden;">
                <span style="font-family:var(--sans); font-size:13px; padding:7px 16px; background:var(--ink); color:var(--ground);">Grid</span>
                <span style="font-family:var(--sans); font-size:13px; padding:7px 16px; background:var(--ground); color:var(--granite); border-left:1px solid var(--line);">List</span>
              </div>
            </div>

            <div style="border:1px solid var(--line); border-radius:3px; background:var(--ground); overflow:hidden;">
              <div style="height:148px; background-image:repeating-linear-gradient(45deg, var(--surface) 0, var(--surface) 7px, var(--ground) 7px, var(--ground) 14px); display:flex; align-items:center; justify-content:center; border-bottom:1px solid var(--line);"><span style={`${mono} font-size:11px; color:var(--granite); background:var(--ground); padding:3px 9px; border-radius:2px;`}>project shot</span></div>
              <div style="padding:18px 20px 20px;">
                <div style="display:flex; justify-content:space-between; align-items:baseline; margin-bottom:6px;"><span style={`${mono} font-size:11px; color:var(--laurel);`}>2025 &middot; structures</span><span style={`${mono} font-size:11px; color:var(--granite);`}>01</span></div>
                <div style="font-family:var(--serif); font-weight:600; font-size:20px; line-height:1.2; letter-spacing:-.01em; margin-bottom:7px;">Re-entry heat shield lattice</div>
                <p style="font-family:var(--sans); font-size:14px; line-height:1.5; color:var(--granite); margin:0;">A mass-optimised TPS substructure, parametrised end to end.</p>
              </div>
            </div>

            <div style="border:1px solid var(--line); border-radius:3px; background:var(--ground); padding:22px;">
              <CardHead>Spec table</CardHead>
              <div style={`${mono} font-size:13px;`}>
                <div style="display:flex; justify-content:space-between; padding:9px 0; border-top:1px solid var(--line);"><span style="color:var(--granite);">mass</span><span style="color:var(--ink);">4.20 kg</span></div>
                <div style="display:flex; justify-content:space-between; padding:9px 0; border-top:1px solid var(--line);"><span style="color:var(--granite);">margin</span><span style="color:var(--laurel);">+1.8&times;</span></div>
                <div style="display:flex; justify-content:space-between; padding:9px 0; border-top:1px solid var(--line);"><span style="color:var(--granite);">status</span><span style="color:var(--falu);">re-test</span></div>
                <div style="display:flex; justify-content:space-between; padding:9px 0; border-top:1px solid var(--line); border-bottom:1px solid var(--line);"><span style="color:var(--granite);">owner</span><span style="color:var(--ink);">N. Hyden</span></div>
              </div>
            </div>

            <div style="border:1px solid var(--line); border-radius:3px; background:var(--surface); padding:20px; display:flex; gap:13px; align-items:flex-start;">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--ocean)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="flex:none; margin-top:1px;"><circle cx="12" cy="12" r="9" /><line x1="12" y1="11" x2="12" y2="16" /><line x1="12" y1="7.5" x2="12" y2="8" /></svg>
              <div><div style="font-family:var(--sans); font-weight:600; font-size:14px; color:var(--ink); margin-bottom:4px;">Note</div><p style="font-family:var(--sans); font-size:14px; line-height:1.55; color:var(--granite); margin:0;">An informational block on Surface. No left-bar gimmick &mdash; the icon carries the meaning.</p></div>
            </div>

            <div style="border:1px solid var(--line); border-radius:3px; background:var(--ground); padding:22px;">
              <CardHead>Blockquote</CardHead>
              <blockquote style="margin:0; padding-left:16px; border-left:2px solid var(--laurel);">
                <p style="font-family:var(--serif); font-style:italic; font-size:19px; line-height:1.4; color:var(--ink); margin:0 0 10px;">Structure first; the surface only has to be honest about it.</p>
                <cite style={`${mono} font-style:normal; font-size:11px; color:var(--granite);`}>&mdash; working principle</cite>
              </blockquote>
            </div>

            <div style="border:1px solid var(--line); border-radius:3px; background:var(--ground); padding:22px;">
              <CardHead>Meter</CardHead>
              <div style={`display:flex; justify-content:space-between; ${mono} font-size:12px; color:var(--granite); margin-bottom:8px;`}><span>verification</span><span style="color:var(--ink);">64%</span></div>
              <div style="height:8px; border-radius:2px; background:var(--surface); overflow:hidden;"><div style="width:64%; height:100%; background:var(--laurel);" /></div>
              <div style={`display:flex; justify-content:space-between; ${mono} font-size:12px; color:var(--granite); margin:18px 0 8px;`}><span>risk burndown</span><span style="color:var(--ink);">28%</span></div>
              <div style="height:8px; border-radius:2px; background:var(--surface); overflow:hidden;"><div style="width:28%; height:100%; background:var(--falu);" /></div>
            </div>

            <div style="border:1px solid var(--line); border-radius:3px; background:var(--ground); padding:22px;">
              <CardHead>Breadcrumb &amp; pagination</CardHead>
              <div style="display:flex; align-items:center; gap:8px; font-family:var(--sans); font-size:13px; color:var(--granite); margin-bottom:18px;"><span>index</span><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="9,5 16,12 9,19" /></svg><span>work</span><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="9,5 16,12 9,19" /></svg><span style="color:var(--ink);">heat shield</span></div>
              <div style="display:flex; align-items:center; gap:6px;">
                <span style={`width:32px; height:32px; display:inline-flex; align-items:center; justify-content:center; border:1px solid var(--line); border-radius:2px; ${mono} font-size:13px; color:var(--granite);`}>1</span>
                <span style={`width:32px; height:32px; display:inline-flex; align-items:center; justify-content:center; border:1px solid var(--ink); border-radius:2px; ${mono} font-size:13px; background:var(--ink); color:var(--ground);`}>2</span>
                <span style={`width:32px; height:32px; display:inline-flex; align-items:center; justify-content:center; border:1px solid var(--line); border-radius:2px; ${mono} font-size:13px; color:var(--granite);`}>3</span>
                <span style={`${mono} font-size:13px; color:var(--granite); padding:0 4px;`}>&hellip;</span>
                <span style={`width:32px; height:32px; display:inline-flex; align-items:center; justify-content:center; border:1px solid var(--line); border-radius:2px; ${mono} font-size:13px; color:var(--granite);`}>9</span>
              </div>
            </div>
          </div>

          <div style="margin-top:20px; display:flex; align-items:center; justify-content:space-between; padding:16px 22px; border:1px solid var(--line); border-radius:3px; background:var(--ground);">
            <span style="font-family:var(--serif); font-weight:600; font-size:18px; letter-spacing:-.01em; color:var(--ink);">Noah Hyden<span style="color:var(--falu);">.</span></span>
            <span style="display:flex; gap:28px; font-family:var(--sans); font-size:14px; color:var(--granite);"><span style="color:var(--ink);">Work</span><span>Writing</span><span>About</span><span>Contact</span></span>
            <span style="display:inline-flex; align-items:center; gap:8px; font-family:var(--sans); font-weight:500; font-size:13px; padding:9px 16px; border-radius:2px; background:var(--falu); color:var(--ground);">Book a call</span>
          </div>

          <div style="margin-top:20px; border:1px solid var(--line); border-radius:3px; overflow:hidden;">
            <div style={`display:flex; align-items:center; gap:8px; padding:11px 16px; background:var(--surface); border-bottom:1px solid var(--line); ${mono} font-size:12px; color:var(--granite);`}>
              <span style="width:9px; height:9px; border-radius:50%; background:var(--falu);" />
              <span style="width:9px; height:9px; border-radius:50%; background:var(--ocean);" />
              <span style="width:9px; height:9px; border-radius:50%; background:var(--laurel);" />
              <span style="margin-left:8px;">tokens.css</span>
            </div>
            <div style={`padding:18px 18px; background:var(--ground); ${mono} font-size:13px; line-height:1.9;`}>
              <div style="color:var(--granite);"><span style="color:var(--ink);">--color-basalt</span> &nbsp;&nbsp;&nbsp;&nbsp;#171E1A &nbsp;&nbsp;&nbsp;<span style="color:var(--ink);">--space-1</span> &nbsp;8px</div>
              <div style="color:var(--granite);"><span style="color:var(--ink);">--color-laurisilva</span> &nbsp;<span style="color:var(--laurel);">#3B5B47</span> &nbsp;&nbsp;&nbsp;<span style="color:var(--ink);">--space-2</span> &nbsp;16px</div>
              <div style="color:var(--granite);"><span style="color:var(--ink);">--color-ocean</span> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span style="color:var(--ocean);">#3B5669</span> &nbsp;&nbsp;&nbsp;<span style="color:var(--ink);">--space-4</span> &nbsp;32px</div>
              <div style="color:var(--granite);"><span style="color:var(--ink);">--color-falur&ouml;d</span> &nbsp;&nbsp;<span style="color:var(--falu);">#801818</span> &nbsp;&nbsp;&nbsp;<span style="color:var(--ink);">--ratio</span> &nbsp;&nbsp;&nbsp;1.25</div>
            </div>
          </div>
        </section>

        <footer style="margin-top:56px; padding-top:24px; border-top:1px solid var(--line); display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:12px;">
          <span style={`${mono} font-size:11px; letter-spacing:.06em; color:var(--granite);`}>Foundations &middot; palette, type, tile, buttons, icons, components.</span>
          <span style={`${mono} font-size:11px; letter-spacing:.06em; color:var(--laurel);`}>built with pimas &rarr; zero JS &rarr; this is the system</span>
        </footer>
      </div>
    </div>
  );
}
