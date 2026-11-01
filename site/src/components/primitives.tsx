import type { Child } from "pimas-ui/dom";

/** Full-width section; `divider` draws a bottom rule and defaults off, because the page-break hairlines were removed on purpose. */
export function Band(props: { tint?: boolean; divider?: boolean; labelledBy?: string; id: string; children?: Child }) {
  const bg = (props.tint ?? false) ? "var(--surface)" : "transparent";
  const rule = (props.divider ?? false) ? " border-bottom:1px solid var(--line);" : "";
  return (
    <section id={props.id} aria-labelledby={props.labelledBy} style={`position:relative; isolation:isolate; background:${bg};${rule}`}>
      {props.children}
    </section>
  );
}

const SPREAD = { sm: "45%", md: "62%", lg: "80%" };

/** Radial ground halo so a block floats on the page tracery instead of punching a rectangular hole in it. */
export function Scrim(props: { spread?: "sm" | "md" | "lg"; style?: string; children?: Child }) {
  const stop = SPREAD[props.spread ?? "md"];
  return (
    <div style={`background:radial-gradient(ellipse at 50% 50%, var(--ground) 0%, var(--ground) ${stop}, transparent 100%);${props.style ?? ""}`}>
      {props.children}
    </div>
  );
}

export function Eyebrow(props: { children?: Child }) {
  return (
    <div style="font-family:var(--mono); font-size:var(--t-2xs); letter-spacing:.18em; text-transform:uppercase; color:var(--granite);">
      {props.children}
    </div>
  );
}

export function PageTitle(props: { style?: string; children?: Child }) {
  return (
    <h1 style={`font-family:var(--serif); font-weight:500; font-size:clamp(var(--t-xl),11vw,var(--t-3xl)); line-height:1.0; letter-spacing:-.025em; color:var(--ink); margin:0 0 26px;${props.style ?? ""}`}>
      {props.children}
    </h1>
  );
}

export function SectionTitle(props: { style?: string; children?: Child }) {
  return (
    <h2 style={`font-family:var(--serif); font-weight:500; font-size:clamp(var(--t-lg),7vw,var(--t-2xl)); line-height:1.06; letter-spacing:-.022em; color:var(--ink); margin:0 0 26px;${props.style ?? ""}`}>
      {props.children}
    </h2>
  );
}

const PAD = { sm: "14px 16px", md: "24px", lg: "28px 30px" };

/** Card surface; every toggle is an explicit prop with a default, and `outline` draws the var(--line) edge. */
export function Card(props: {
  href?: string;
  external?: boolean;
  tone?: "ground" | "surface";
  outline?: boolean;
  lift?: boolean;
  pad?: "sm" | "md" | "lg";
  style?: string;
  children?: Child;
}) {
  const edge = (props.outline ?? true) ? " border:1px solid var(--line);" : "";
  const cls = (props.lift ?? true) ? "lift" : "";
  const style =
    `display:block; border-radius:3px; background:var(--${props.tone ?? "ground"}); padding:${PAD[props.pad ?? "md"]};` +
    edge +
    (props.style ?? "");
  if (!props.href) return <div className={cls} style={style}>{props.children}</div>;
  return (props.external ?? false) ? (
    <a href={props.href} target="_blank" rel="noopener" className={cls} style={style}>{props.children}</a>
  ) : (
    <a href={props.href} className={cls} style={style}>{props.children}</a>
  );
}

const SIZE = {
  sm: "font-size:var(--t-xs); padding:8px 14px;",
  md: "font-size:var(--t-xs); padding:11px 18px;",
  lg: "font-size:var(--t-sm); padding:13px 24px;",
};

/** Action; every toggle is an explicit prop with a default, and `outline` draws a currentColor edge so it tracks the text. */
export function Button(props: {
  href?: string;
  external?: boolean;
  fill?: "solid" | "tonal" | "none";
  accent?: "laurel" | "falu" | "ocean";
  size?: "sm" | "md" | "lg";
  outline?: boolean;
  children?: Child;
}) {
  const c = `var(--${props.accent ?? "laurel"})`;
  const paint = {
    solid: `background:${c}; color:var(--ground);`,
    tonal: "background:var(--surface); color:var(--ink);",
    none: `background:transparent; color:${c};`,
  }[props.fill ?? "solid"];
  const edge = (props.outline ?? false) ? " border:1px solid currentColor;" : "";
  const style = `display:inline-flex; align-items:center; gap:9px; font-family:var(--sans); font-weight:500; border-radius:2px; ${paint}${edge} ${SIZE[props.size ?? "md"]}`;
  if (!props.href) return <button type="button" className="btn" style={style}>{props.children}</button>;
  return (props.external ?? false) ? (
    <a href={props.href} target="_blank" rel="noopener" className="btn" style={style}>{props.children}</a>
  ) : (
    <a href={props.href} className="btn" style={style}>{props.children}</a>
  );
}

export function BuildFetchError(props: { title: string; body: string; href: string; cta: string }) {
  return (
    <Card tone="surface" outline={false} lift={false} pad="lg" style="display:flex; gap:14px; align-items:flex-start;">
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--falu)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="flex:none; margin-top:1px;"><circle cx="12" cy="12" r="9" /><line x1="12" y1="8" x2="12" y2="13" /><line x1="12" y1="16" x2="12" y2="16.5" /></svg>
      <div>
        <div style="font-family:var(--serif); font-weight:600; font-size:var(--t-md); margin-bottom:6px;">{props.title}</div>
        <p style="font-family:var(--sans); font-size:var(--t-xs); line-height:1.55; color:var(--granite); margin:0 0 14px;">{props.body}</p>
        <Button href={props.href} external accent="falu">{props.cta} &rarr;</Button>
      </div>
    </Card>
  );
}
