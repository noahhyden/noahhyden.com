/**
 * The sticky top nav. `active` highlights the current section the way the
 * hand-built pages did (ink + medium weight, vs granite for the rest).
 */
import { GitHubIcon, LinkedInIcon } from "./icons.js";

type Section = "about" | "projects" | "writing" | null;

function link(href: string, label: string, active: boolean) {
  const color = active ? "var(--ink)" : "var(--granite)";
  const weight = active ? "font-weight:500;" : "";
  return (
    <a href={href} style={`font-family:var(--sans); font-size:14px; color:${color}; ${weight}`}>
      {label}
    </a>
  );
}

export function Nav(props: { active?: Section } = {}) {
  const active = props.active ?? null;
  return (
    <nav style="position:sticky; top:0; z-index:10; display:flex; align-items:center; justify-content:space-between; padding:18px 40px; background:rgba(229,228,219,.86); backdrop-filter:blur(8px); border-bottom:1px solid var(--line);">
      <a href="/" style="font-family:var(--serif); font-weight:600; font-size:19px; letter-spacing:-.01em; color:var(--ink); white-space:nowrap;">
        Noah Hyden<span style="color:var(--falu);">.</span>
      </a>
      <div style="display:flex; align-items:center; gap:30px;">
        {link("/about/", "About", active === "about")}
        {link("/projects/", "Projects", active === "projects")}
        {link("/writing/", "Writing", active === "writing")}
        <span style="width:1px; height:18px; background:var(--line);" />
        <a href="https://github.com/noahhyden" target="_blank" rel="noopener" aria-label="GitHub" style="display:inline-flex; color:var(--granite);">
          <GitHubIcon />
        </a>
        <a href="https://www.linkedin.com/in/noah-hyden/" target="_blank" rel="noopener" aria-label="LinkedIn" style="display:inline-flex; color:var(--granite);">
          <LinkedInIcon />
        </a>
      </div>
    </nav>
  );
}
