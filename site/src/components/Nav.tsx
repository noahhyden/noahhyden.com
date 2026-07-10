/**
 * The sticky top nav. `active` highlights the current section the way the
 * hand-built pages did (ink + medium weight, vs granite for the rest).
 */
import { GitHubIcon, LinkedInIcon } from "./icons.js";

type Section = "about" | "pimas" | "projects" | "papers" | null;

function link(href: string, label: string, active: boolean) {
  const color = active ? "var(--ink)" : "var(--granite)";
  const weight = active ? "font-weight:500;" : "";
  const underline = active ? "border-bottom:2px solid var(--falu); padding-bottom:2px;" : "";
  return (
    <a href={href} class="ln" style={`font-family:var(--sans); font-size:14px; color:${color}; ${weight}${underline}`}>
      {label}
    </a>
  );
}

export function Nav(props: { active?: Section } = {}) {
  const active = props.active ?? null;
  return (
    <nav style="position:sticky; top:0; z-index:10; display:flex; align-items:center; justify-content:space-between; padding:18px 40px; background:var(--nav-bg); backdrop-filter:blur(8px); border-bottom:1px solid var(--line);">
      <a href="/" style="font-family:var(--serif); font-weight:600; font-size:19px; letter-spacing:-.01em; color:var(--ink); white-space:nowrap;">
        Noah Hyden<span style="color:var(--falu);">.</span>
      </a>
      <div style="display:flex; align-items:center; gap:30px;">
        {link("/#about", "About", false)}
        {link("/pimas/", "pimas", active === "pimas")}
        {link("/projects/", "Projects", active === "projects")}
        {link("/papers/", "Papers", active === "papers")}
        <span style="width:1px; height:18px; background:var(--line);" />
        <a href="https://github.com/noahhyden" target="_blank" rel="noopener" aria-label="GitHub" style="display:inline-flex; color:var(--granite);">
          <GitHubIcon />
        </a>
        <a href="https://www.linkedin.com/in/noah-hyden/" target="_blank" rel="noopener" aria-label="LinkedIn" style="display:inline-flex; color:var(--granite);">
          <LinkedInIcon />
        </a>
        <button id="theme-toggle" type="button" class="ln" aria-label="Toggle light or dark theme" title="Toggle theme" style="display:inline-flex; align-items:center; justify-content:center; padding:0; border:0; background:none; color:var(--granite); cursor:pointer;">
          <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
            <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" stroke-width="1.6" />
            <path d="M12 3a9 9 0 0 1 0 18z" fill="currentColor" />
          </svg>
        </button>
      </div>
    </nav>
  );
}
