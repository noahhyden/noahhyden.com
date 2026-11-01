import type { PageMeta } from "../design.js";
import { Shell } from "../components/Shell.js";
import { ArrowIcon } from "../components/icons.js";
import { BuildFetchError } from "../components/primitives.js";
import { ghHeaders } from "../gh.js";

/** Pinned repos shown as cards above the list, in this order. */
const PINNED = ["von-neumann", "pimas", "ataegina-cli"];

export const meta: PageMeta = {
  path: "/projects/",
  title: "Projects",
  description: "Open-source work, pulled from GitHub: tools and experiments.",
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
  HTML: "#9a4a36", Python: "#3b5b47", Ruby: "#801818", Shell: "#4a7a4a", TypeScript: "#3b5669",
};

const RTF = new Intl.RelativeTimeFormat("en", { numeric: "auto" });

function relDate(iso: string): string {
  if (!iso) return "";
  const days = Math.max(0, Math.floor((Date.now() - new Date(iso).getTime()) / 86400000));
  if (days < 30) return RTF.format(-days, "day");
  if (days < 365) return RTF.format(-Math.floor(days / 30), "month");
  return RTF.format(-Math.floor(days / 365), "year");
}

export async function getData(): Promise<{ repos: Repo[]; error: boolean }> {
  try {
    const res = await fetch(
      "https://api.github.com/users/noahhyden/repos?per_page=100&sort=updated",
      { headers: ghHeaders() },
    );
    if (!res.ok) throw new Error("status " + res.status);
    const raw = await res.json();
    const repos: Repo[] = (Array.isArray(raw) ? raw : [])
      .filter((r) => !r.fork && !r.archived)
      .sort((a, b) => new Date(b.pushed_at).getTime() - new Date(a.pushed_at).getTime())
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
        pinned: PINNED.includes(r.name),
      }));
    return { repos, error: false };
  } catch (e) {
    console.error("projects: GitHub fetch failed -", e instanceof Error ? e.message : e);
    return { repos: [], error: true };
  }
}

/** Repo link: `card` is the pinned tile, otherwise a row in the full list. */
function RepoLink(props: { r: Repo; card?: boolean }) {
  const r = props.r;
  const c = props.card;
  const meta = (
    <>
      {r.lang ? (
        <span style="display:inline-flex; align-items:center; gap:7px;"><span style={`width:9px; height:9px; border-radius:50%; background:${r.langColor};`} />{r.lang}</span>
      ) : null}
      {r.hasStars ? (
        <span style="display:inline-flex; align-items:center; gap:6px;">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><polygon points="12,3 14.6,9 21,9.5 16,13.8 17.6,20 12,16.5 6.4,20 8,13.8 3,9.5 9.4,9" /></svg>
          {String(r.stars)}
        </span>
      ) : null}
    </>
  );
  const icon = (
    <svg width={c ? 18 : 16} height={c ? 18 : 16} viewBox="0 0 24 24" fill="none" stroke="var(--ocean)" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" style="flex:none;">
      <path d="M4 5v14a1 1 0 0 0 1 1h15" />
      <path d="M4 5a1 1 0 0 1 1-1h15v12H5a1 1 0 0 0-1 1" />
    </svg>
  );
  const nameStyle = `font-family:var(--serif); font-weight:600; font-size:${c ? 19 : 18}px; line-height:1.2; letter-spacing:-.01em; color:var(--ink); word-break:break-word;`;
  if (!c) {
    return (
      <a className="lift" href={r.url} target="_blank" rel="noopener" style="display:flex; align-items:flex-start; justify-content:space-between; gap:28px; border-top:1px solid var(--line); padding:22px 4px 22px; flex-wrap:wrap;">
        <div style="flex:1 1 320px; min-width:0;">
          <div style="display:flex; align-items:center; gap:10px; margin-bottom:6px;">{icon}<span style={nameStyle}>{r.name}</span></div>
          <p style="font-family:var(--sans); font-size:14.5px; line-height:1.55; color:var(--granite); margin:0; max-width:64ch;">{r.desc}</p>
        </div>
        <div style="flex:none; display:flex; align-items:center; gap:18px; font-family:var(--mono); font-size:12px; color:var(--granite); padding-top:2px;">
          {meta}
          <span>{r.updated}</span>
        </div>
      </a>
    );
  }
  return (
    <a className="lift" href={r.url} target="_blank" rel="noopener" style="display:flex; flex-direction:column; border:1px solid var(--line); border-radius:3px; background:var(--ground); padding:24px 24px 20px; min-height:168px;">
      <div style="display:flex; align-items:flex-start; justify-content:space-between; gap:12px; margin-bottom:12px;">
        <div style="display:flex; align-items:center; gap:10px; min-width:0;">{icon}<span style={nameStyle}>{r.name}</span></div>
        {r.pinned ? (
          <span style="flex:none; font-family:var(--mono); font-size:10px; letter-spacing:.08em; text-transform:uppercase; color:var(--falu); border:1px solid var(--falu); border-radius:2px; padding:3px 7px;">pinned</span>
        ) : null}
      </div>
      <p style="font-family:var(--sans); font-size:14.5px; line-height:1.55; color:var(--granite); margin:0 0 auto; padding-bottom:18px;">{r.desc}</p>
      <div style="display:flex; align-items:center; gap:18px; font-family:var(--mono); font-size:12px; color:var(--granite); border-top:1px solid var(--line); padding-top:14px;">
        {meta}
        <span style="margin-left:auto; color:var(--granite);">{r.updated}</span>
      </div>
    </a>
  );
}

function SectionLabel(props: { children: string }) {
  return (
    <div style="font-family:var(--mono); font-size:12px; letter-spacing:.14em; text-transform:uppercase; color:var(--granite); margin:0 0 20px;">
      {props.children}
    </div>
  );
}

export default function Projects(props: { repos?: Repo[]; error?: boolean }) {
  const repos = props.repos ?? [];
  const error = props.error ?? false;
  const hasRepos = !error && repos.length > 0;
  const isEmpty = !error && repos.length === 0;

  const pinned = PINNED.map((name) => repos.find((r) => r.name === name)).filter(
    (r): r is Repo => r !== undefined,
  );
  const rest = repos.filter((r) => !r.pinned);

  return (
    <Shell active="projects">
      <header style="max-width:1080px; margin:0 auto; padding:80px clamp(20px,5vw,40px) 40px;">
        <div style="display:flex; align-items:baseline; justify-content:space-between; flex-wrap:wrap; gap:12px;">
          <div>
            <div style="font-family:var(--mono); font-size:12px; letter-spacing:.18em; text-transform:uppercase; color:var(--granite); margin:0 0 22px;">Projects - baked in from GitHub</div>
            <h1 style="font-family:var(--serif); font-weight:500; font-size:clamp(34px,7vw,52px); line-height:1.05; letter-spacing:-.022em; margin:0; max-width:18ch;">What I&rsquo;ve been building.</h1>
          </div>
          <a href="https://github.com/noahhyden" target="_blank" rel="noopener" style="display:inline-flex; align-items:center; gap:8px; font-family:var(--mono); font-size:13px; color:var(--falu); border-bottom:1px solid var(--falu); padding-bottom:2px;">@noahhyden on GitHub &rarr;</a>
        </div>
        <p style="font-family:var(--sans); font-size:17px; line-height:1.6; color:var(--granite); margin:24px 0 0; max-width:58ch;">Pulled from my public repositories at build time. A few pinned highlights first, then everything else, most recently pushed first. Some are finished, some are experiments.</p>
      </header>

      <main style="max-width:1080px; margin:0 auto; padding:8px clamp(20px,5vw,40px) 24px;">
        {error ? <BuildFetchError title="Couldn&rsquo;t reach GitHub at build time" body="The repository list usually bakes in at build. If it&rsquo;s being stubborn, the projects are all on my profile directly." href="https://github.com/noahhyden?tab=repositories" cta="Open my repositories" /> : null}

        {hasRepos && pinned.length > 0 ? (
          <section style="margin-bottom:56px;">
            <SectionLabel>Pinned</SectionLabel>
            <div style="display:grid; grid-template-columns:repeat(2,1fr); gap:20px;">
              {pinned.map((r) => <RepoLink card r={r} />)}
            </div>
          </section>
        ) : null}

        {hasRepos && rest.length > 0 ? (
          <section>
            <SectionLabel>{`All projects (${rest.length})`}</SectionLabel>
            <div style="border-bottom:1px solid var(--line);">
              {rest.map((r) => <RepoLink r={r} />)}
            </div>
            <div style="margin-top:28px; text-align:center;">
              <a href="https://github.com/noahhyden?tab=repositories" target="_blank" rel="noopener" style="display:inline-flex; align-items:center; gap:9px; font-family:var(--sans); font-weight:500; font-size:15px; padding:13px 24px; border-radius:2px; border:1px solid var(--granite); color:var(--ink);">See all repositories on GitHub <ArrowIcon size={16} /></a>
            </div>
          </section>
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
