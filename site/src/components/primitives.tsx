import type { Child } from "pimas-ui/dom";
import { Shell } from "./Shell.js";

type Section = "about" | "pimas" | "projects" | "papers" | null;

/** Full-width section. Content is not padded here - callers pad. */
export function Band(props: { bordered?: boolean; tint?: boolean; labelledBy?: string; id?: string; children?: Child }) {
  const bg = props.tint ? "var(--surface)" : "var(--ground)";
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

export function Block(props: { label?: string; title?: string; children?: Child }) {
  return (
    <section style="margin-bottom:56px;">
      {props.label ? <div style="margin-bottom:12px;"><Eyebrow>{props.label}</Eyebrow></div> : null}
      {props.title ? <SectionTitle>{props.title}</SectionTitle> : null}
      {props.children}
    </section>
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
  foreground: "background:var(--ink); color:var(--ground); border:1px solid var(--ink);",
  outline: "background:transparent; color:var(--ink); border:1px solid var(--granite);",
};
const SIZE = {
  sm: "font-size:13px; padding:8px 14px;",
  md: "font-size:14px; padding:11px 18px;",
  lg: "font-size:16px; padding:14px 24px;",
};

export function Button(props: { href: string; variant?: "accent" | "foreground" | "outline"; size?: "sm" | "md" | "lg"; external?: boolean; children?: Child }) {
  const style = `display:inline-flex; align-items:center; gap:9px; font-family:var(--sans); font-weight:500; border-radius:2px; ${VARIANT[props.variant ?? "accent"]} ${SIZE[props.size ?? "md"]}`;
  return props.external ? (
    <a href={props.href} target="_blank" rel="noopener" className="btn" style={style}>{props.children}</a>
  ) : (
    <a href={props.href} className="btn" style={style}>{props.children}</a>
  );
}

export function PageShell(props: { title: string; sub?: string; standfirst?: string; active?: Section; width?: number; children?: Child }) {
  const w = props.width ?? 1080;
  return (
    <Shell active={props.active ?? null}>
      <header style="border-bottom:1px solid var(--line);">
        <div style={`max-width:${w}px; margin:0 auto; padding:72px clamp(20px,5vw,40px) 56px;`}>
          {props.sub ? <div style="margin-bottom:16px;"><Eyebrow>{props.sub}</Eyebrow></div> : null}
          <PageTitle style="font-size:clamp(36px,8vw,56px);">{props.title}</PageTitle>
          {props.standfirst ? (
            <p style="font-family:var(--sans); font-size:18px; line-height:1.6; color:var(--granite); margin:0; max-width:60ch;">{props.standfirst}</p>
          ) : null}
        </div>
      </header>
      <main style={`max-width:${w}px; margin:0 auto; padding:56px clamp(20px,5vw,40px) 96px;`}>
        {props.children}
      </main>
    </Shell>
  );
}
