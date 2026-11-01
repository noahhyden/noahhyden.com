import type { Child } from "pimas-ui/dom";

/** Full-width section. Content is not padded here - callers pad. */
export function Band(props: { bordered?: boolean; tint?: boolean; labelledBy?: string; id?: string; children?: Child }) {
  const bg = props.tint ? "var(--surface)" : "transparent";
  const border = props.bordered ? " border-bottom:1px solid var(--line);" : "";
  return (
    <section id={props.id} aria-labelledby={props.labelledBy} style={`background:${bg};${border}`}>
      {props.children}
    </section>
  );
}

export function Eyebrow(props: { children?: Child }) {
  return (
    <div style="font-family:var(--mono); font-size:12px; letter-spacing:.18em; text-transform:uppercase; color:var(--granite);">
      {props.children}
    </div>
  );
}

export function PageTitle(props: { style?: string; children?: Child }) {
  return (
    <h1 style={`font-family:var(--serif); font-weight:500; font-size:clamp(40px,11vw,76px); line-height:1.0; letter-spacing:-.025em; color:var(--ink); margin:0 0 26px;${props.style ?? ""}`}>
      {props.children}
    </h1>
  );
}

export function SectionTitle(props: { style?: string; children?: Child }) {
  return (
    <h2 style={`font-family:var(--serif); font-weight:500; font-size:clamp(32px,7vw,44px); line-height:1.06; letter-spacing:-.022em; color:var(--ink); margin:0 0 26px;${props.style ?? ""}`}>
      {props.children}
    </h2>
  );
}

export function Card(props: { tone?: "surface" | "panel"; href?: string; style?: string; children?: Child }) {
  const panel = props.tone === "panel";
  const base = panel
    ? "display:block; border:1px solid var(--line); border-radius:3px; background:var(--surface); padding:20px 22px;"
    : "display:block; border:1px solid var(--line); border-radius:3px; background:var(--ground); padding:24px;";
  const style = base + (props.style ?? "");
  return props.href ? (
    <a href={props.href} className="lift" style={style}>{props.children}</a>
  ) : (
    <div className="lift" style={style}>{props.children}</div>
  );
}

const VARIANT = {
  accent: "background:var(--laurel); color:var(--ground); border:1px solid var(--laurel);",
  outline: "background:transparent; color:var(--ink); border:1px solid var(--granite);",
};
const SIZE = {
  md: "font-size:14px; padding:11px 18px;",
};

export function Button(props: { href: string; variant?: "accent" | "outline"; size?: "md"; external?: boolean; children?: Child }) {
  const style = `display:inline-flex; align-items:center; gap:9px; font-family:var(--sans); font-weight:500; border-radius:2px; ${VARIANT[props.variant ?? "accent"]} ${SIZE[props.size ?? "md"]}`;
  return props.external ? (
    <a href={props.href} target="_blank" rel="noopener" className="btn" style={style}>{props.children}</a>
  ) : (
    <a href={props.href} className="btn" style={style}>{props.children}</a>
  );
}

export function BuildFetchError(props: { title: string; body: string; href: string; cta: string }) {
  return (
    <div style="border:1px solid var(--line); border-radius:3px; background:var(--surface); padding:28px; display:flex; gap:14px; align-items:flex-start;">
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--falu)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="flex:none; margin-top:1px;"><circle cx="12" cy="12" r="9" /><line x1="12" y1="8" x2="12" y2="13" /><line x1="12" y1="16" x2="12" y2="16.5" /></svg>
      <div>
        <div style="font-family:var(--serif); font-weight:600; font-size:19px; margin-bottom:6px;">{props.title}</div>
        <p style="font-family:var(--sans); font-size:15px; line-height:1.55; color:var(--granite); margin:0 0 14px;">{props.body}</p>
        <a className="btn" href={props.href} target="_blank" rel="noopener" style="display:inline-flex; align-items:center; gap:8px; font-family:var(--sans); font-weight:500; font-size:14px; padding:10px 18px; border-radius:2px; background:var(--falu); color:var(--ground);">{props.cta} &rarr;</a>
      </div>
    </div>
  );
}
