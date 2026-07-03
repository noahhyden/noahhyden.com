/**
 * Projects - the repo list. The original fetched GitHub live in the browser
 * (a runtime external request + a loading/skeleton state). Here `getData` runs
 * at BUILD time, so the shipped page is static HTML with the repos baked in and
 * makes zero runtime requests. If the build-time fetch fails, we prerender the
 * same graceful "couldn't reach GitHub" block the original showed.
 */
import type { PageMeta } from "../design.js";
import { Shell } from "../components/Shell.js";

export const meta: PageMeta = {
  path: "/projects/",
  title: "Projects",
  description: "Open-source work, pulled from GitHub - tools, experiments, and the occasional rabbit hole.",
};

interface Repo {
  name: string;
  desc: string;
  lang: string;
  langColor: string;
  stars: number;
  hasStars: boolean;
  updated: string;
  url: string;
  pinned: boolean;
}

const LANG_COLOR: Record<string, string> = {
  JavaScript: "#a89234", TypeScript: "#3b5669", Python: "#3b5b47",
  Rust: "#9a5a3a", Go: "#3f7f86", C: "#6e7d87", "C++": "#7a5a82",
  Java: "#9a6a30", HTML: "#9a4a36", CSS: "#5a5a8a", Shell: "#4a7a4a",
  Jupyter: "#a8722e", "Jupyter Notebook": "#a8722e", Svelte: "#9a4030",
  Vue: "#3b5b47", Ruby: "#801818", Julia: "#5a4a82", MATLAB: "#9a5a3a",
  Fortran: "#7a4a6a", Lua: "#3b4a7a", Dockerfile: "#3b5669",
};

function relDate(iso: string): string {
  if (!iso) return "";
  const days = Math.floor((Date.now() - new Date(iso).getTime()) / 86400000);
  if (days <= 0) return "today";
  if (days === 1) return "yesterday";
  if (days < 30) return days + "d ago";
  if (days < 365) {
    const m = Math.floor(days / 30);
    return m + (m === 1 ? " month ago" : " months ago");
  }
  const y = Math.floor(days / 365);
  return y + (y === 1 ? " year ago" : " years ago");
}

/** Runs at build time (Node). Fetches + shapes the repo list. */
export async function getData(): Promise<{ repos: Repo[]; error: boolean }> {
  try {
    const res = await fetch(
      "https://api.github.com/users/noahhyden/repos?per_page=100&sort=updated",
      { headers: { Accept: "application/vnd.github+json", "User-Agent": "noahhyden.com-build" } },
    );
    if (!res.ok) throw new Error("status " + res.status);
    const raw = await res.json();
    const repos: Repo[] = (Array.isArray(raw) ? raw : [])
      .filter((r) => !r.fork && !r.archived)
      .sort((a, b) => {
        const ap = /ataegina/i.test(a.name) ? 1 : 0;
        const bp = /ataegina/i.test(b.name) ? 1 : 0;
        if (ap !== bp) return bp - ap;
        return new Date(b.pushed_at).getTime() - new Date(a.pushed_at).getTime();
      })
      .map((r) => ({
        name: r.name,
        // Sanitize upstream copy to the repo's typography rules (no em-dashes).
        desc: (r.description || "No description provided.").replace(/\u2014/g, "-"),
        lang: r.language || "",
        langColor: LANG_COLOR[r.language] || "#716f65",
        stars: r.stargazers_count,
        hasStars: r.stargazers_count > 0,
        updated: "updated " + relDate(r.pushed_at),
        url: r.html_url,
        pinned: /ataegina/i.test(r.name),
      }));
    return { repos, error: false };
  } catch {
    return { repos: [], error: true };
  }
}

function RepoCard(props: { r: Repo }) {
  const r = props.r;
  return (
    <a href={r.url} target="_blank" rel="noopener" style="display:flex; flex-direction:column; border:1px solid var(--line); border-radius:3px; background:var(--ground); padding:24px 24px 20px; min-height:168px;">
      <div style="display:flex; align-items:flex-start; justify-content:space-between; gap:12px; margin-bottom:12px;">
        <div style="display:flex; align-items:center; gap:10px; min-width:0;">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--ocean)" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" style="flex:none;">
            <path d="M4 5v14a1 1 0 0 0 1 1h15" />
            <path d="M4 5a1 1 0 0 1 1-1h15v12H5a1 1 0 0 0-1 1" />
          </svg>
          <span style="font-family:var(--serif); font-weight:600; font-size:19px; line-height:1.2; letter-spacing:-.01em; color:var(--ink); word-break:break-word;">{r.name}</span>
        </div>
        {r.pinned ? (
          <span style="flex:none; font-family:var(--mono); font-size:10px; letter-spacing:.08em; text-transform:uppercase; color:var(--falu); border:1px solid var(--falu); border-radius:2px; padding:3px 7px;">pinned</span>
        ) : null}
      </div>
      <p style="font-family:var(--sans); font-size:14.5px; line-height:1.55; color:var(--granite); margin:0 0 auto; padding-bottom:18px;">{r.desc}</p>
      <div style="display:flex; align-items:center; gap:18px; font-family:var(--mono); font-size:12px; color:var(--granite); border-top:1px solid var(--line); padding-top:14px;">
        {r.lang ? (
          <span style="display:inline-flex; align-items:center; gap:7px;"><span style={`width:9px; height:9px; border-radius:50%; background:${r.langColor};`} />{r.lang}</span>
        ) : null}
        {r.hasStars ? (
          <span style="display:inline-flex; align-items:center; gap:6px;">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><polygon points="12,3 14.6,9 21,9.5 16,13.8 17.6,20 12,16.5 6.4,20 8,13.8 3,9.5 9.4,9" /></svg>
            {String(r.stars)}
          </span>
        ) : null}
        <span style="margin-left:auto; color:var(--granite);">{r.updated}</span>
      </div>
    </a>
  );
}

function ErrorBlock() {
  return (
    <div style="border:1px solid var(--line); border-radius:3px; background:var(--surface); padding:28px; display:flex; gap:14px; align-items:flex-start;">
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--falu)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="flex:none; margin-top:1px;"><circle cx="12" cy="12" r="9" /><line x1="12" y1="8" x2="12" y2="13" /><line x1="12" y1="16" x2="12" y2="16.5" /></svg>
      <div>
        <div style="font-family:var(--serif); font-weight:600; font-size:19px; margin-bottom:6px;">Couldn&rsquo;t reach GitHub at build time</div>
        <p style="font-family:var(--sans); font-size:15px; line-height:1.55; color:var(--granite); margin:0 0 14px;">The repository list usually bakes in at build. If it&rsquo;s being stubborn, the projects are all on my profile directly.</p>
        <a href="https://github.com/noahhyden?tab=repositories" target="_blank" rel="noopener" style="display:inline-flex; align-items:center; gap:8px; font-family:var(--sans); font-weight:500; font-size:14px; padding:10px 18px; border-radius:2px; background:var(--falu); color:var(--ground);">Open my repositories &rarr;</a>
      </div>
    </div>
  );
}

export default function Projects(props: { repos?: Repo[]; error?: boolean }) {
  const repos = props.repos ?? [];
  const error = props.error ?? false;
  const hasRepos = !error && repos.length > 0;
  const isEmpty = !error && repos.length === 0;

  return (
    <Shell active="projects">
      <header style="max-width:1080px; margin:0 auto; padding:80px 40px 40px;">
        <div style="display:flex; align-items:baseline; justify-content:space-between; flex-wrap:wrap; gap:12px;">
          <div>
            <div style="font-family:var(--mono); font-size:12px; letter-spacing:.18em; text-transform:uppercase; color:var(--granite); margin:0 0 22px;">Projects - baked in from GitHub</div>
            <h1 style="font-family:var(--serif); font-weight:500; font-size:52px; line-height:1.05; letter-spacing:-.022em; margin:0; max-width:18ch;">What I&rsquo;ve been building.</h1>
          </div>
          <a href="https://github.com/noahhyden" target="_blank" rel="noopener" style="display:inline-flex; align-items:center; gap:8px; font-family:var(--mono); font-size:13px; color:var(--falu); border-bottom:1px solid var(--falu); padding-bottom:2px;">@noahhyden on GitHub &rarr;</a>
        </div>
        <p style="font-family:var(--sans); font-size:17px; line-height:1.6; color:var(--granite); margin:24px 0 0; max-width:58ch;">Pulled from my public repositories at build time, freshest first. Some are finished, some are experiments, some are me thinking out loud in code.</p>
      </header>

      <main style="max-width:1080px; margin:0 auto; padding:8px 40px 24px;">
        {error ? <ErrorBlock /> : null}
        {hasRepos ? (
          <div>
            <div style="display:grid; grid-template-columns:repeat(2,1fr); gap:20px;">
              {repos.map((r) => <RepoCard r={r} />)}
            </div>
            <div style="margin-top:28px; text-align:center;">
              <a href="https://github.com/noahhyden?tab=repositories" target="_blank" rel="noopener" style="display:inline-flex; align-items:center; gap:9px; font-family:var(--sans); font-weight:500; font-size:15px; padding:13px 24px; border-radius:2px; border:1px solid var(--granite); color:var(--ink);">See all repositories on GitHub <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><line x1="6" y1="18" x2="18" y2="6" /><polyline points="8,6 18,6 18,16" /></svg></a>
            </div>
          </div>
        ) : null}
        {isEmpty ? (
          <div style="border:1px solid var(--line); border-radius:3px; background:var(--surface); padding:40px; text-align:center;">
            <p style="font-family:var(--sans); font-size:16px; color:var(--granite); margin:0;">No public repositories to show yet - check back soon.</p>
          </div>
        ) : null}
      </main>
    </Shell>
  );
}
