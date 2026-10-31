import { GitHubIcon, LinkedInIcon, Mark } from "./icons.js";

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
    <nav style="position:sticky; top:0; z-index:10; background:var(--nav-bg); backdrop-filter:blur(8px); border-bottom:1px solid var(--line);">
      <div style="max-width:1080px; margin:0 auto; min-height:64px; padding:8px 40px; box-sizing:border-box; display:flex; flex-wrap:wrap; align-items:center; justify-content:space-between; gap:8px 28px;">
        <a href="/" style="display:inline-flex; align-items:center; gap:11px; font-family:var(--serif); font-weight:600; font-size:19px; letter-spacing:-.01em; color:var(--ink); white-space:nowrap;">
          <Mark size={34} />
          <span>Noah Hyden<span style="color:var(--falu);">.</span></span>
        </a>
        <div style="display:flex; flex-wrap:wrap; align-items:center; gap:8px 28px;">
          {link("/#about", "About", false)}
          {link("/pimas/", "pimas", active === "pimas")}
          {link("/projects/", "Projects", active === "projects")}
          {link("/papers/", "Papers", active === "papers")}
        </div>
        <div style="display:flex; align-items:center; gap:18px;">
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
      </div>
    </nav>
  );
}
