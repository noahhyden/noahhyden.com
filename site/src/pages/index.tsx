import type { Child } from "pimas-ui/dom";
import type { PageMeta } from "../design.js";
import { Shell } from "../components/Shell.js";
import { ArrowIcon, GitHubIcon, LinkedInIcon } from "../components/icons.js";
import { Band, Eyebrow, PageTitle, SectionTitle, Card, Button, BuildFetchError } from "../components/primitives.js";
import { ghHeaders } from "../gh.js";

export const meta: PageMeta = {
  path: "/",
  title: "Noah Hyden",
  description:
    "Noah Hyden - aerospace engineer in Stockholm. Airframes, software, and pimas: a reactive UI engine an AI agent can simulate against before it acts.",
};

/** Pinned repos shown as cards above the list, in this order. */
const PINNED = ["von-neumann", "pimas", "ataegina-cli"];

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

/** The live von-neumann site papers are published beside. */
const VN_SITE = "https://vn.noahhyden.com";
const VN_REPO = "https://github.com/noahhyden/von-neumann";

interface Author {
  name: string;
  affiliation: string;
  orcid: string;
}

interface Paper {
  slug: string;
  title: string;
  authors: Author[];
  abstract: string;
  date: string;
  keywords: string[];
  citeCount: number;
  /** The typeset PDF, published beside the live von-neumann site. */
  pdf: string;
  /** The paper's source directory in the von-neumann repo. */
  source: string;
}

/** Sanitize upstream prose: no em-dash, fold LaTeX `--` to a spaced hyphen. */
function clean(s: string): string {
  return String(s)
    .replace(/\u2014/g, "-")
    .replace(/\s*--\s*/g, " - ")
    .replace(/\s+/g, " ")
    .trim();
}

async function getRepos(): Promise<{ repos: Repo[]; error: boolean }> {
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
    console.error("home: repos GitHub fetch failed -", e instanceof Error ? e.message : e);
    return { repos: [], error: true };
  }
}

async function getPapers(): Promise<{ papers: Paper[]; error: boolean }> {
  try {
    const listRes = await fetch(
      "https://api.github.com/repos/noahhyden/von-neumann/contents/papers",
      { headers: ghHeaders() },
    );
    if (!listRes.ok) throw new Error("contents status " + listRes.status);
    const entries = await listRes.json();
    const slugs: string[] = (Array.isArray(entries) ? entries : [])
      .filter((e) => e.type === "dir" && e.name !== "scripts" && e.name !== "node_modules")
      .map((e) => e.name);

    const papers = (
      await Promise.all(
        slugs.map(async (slug) => {
          const res = await fetch(
            `https://raw.githubusercontent.com/noahhyden/von-neumann/main/papers/${slug}/paper.json`,
            { headers: { "User-Agent": "noahhyden.com-build" } },
          );
          if (!res.ok) return null;
          const p = await res.json();
          if (!p || !p.title) return null; // scaffold-only dir, skip
          const paper: Paper = {
            slug: p.slug || slug,
            title: clean(p.title),
            authors: (p.authors || []).map((a: Author) => ({
              name: (a.name || "").trim(),
              affiliation: (a.affiliation || "").trim(),
              orcid: (a.orcid || "").trim(),
            })),
            abstract: clean(p.abstract || ""),
            date: p.date || "",
            keywords: (p.keywords || []).map((k: string) => k.trim()),
            citeCount: Array.isArray(p.cites) ? p.cites.length : 0,
            pdf: `${VN_SITE}/papers/${p.slug || slug}.pdf`,
            source: `${VN_REPO}/tree/main/papers/${p.slug || slug}`,
          };
          return paper;
        }),
      )
    ).filter((p): p is Paper => p !== null);

    papers.sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));
    return { papers, error: false };
  } catch (e) {
    console.error("home: papers GitHub fetch failed -", e instanceof Error ? e.message : e);
    return { papers: [], error: true };
  }
}

export async function getData(): Promise<{ repos: Repo[]; reposError: boolean; papers: Paper[]; papersError: boolean }> {
  const [r, p] = await Promise.all([getRepos(), getPapers()]);
  return { repos: r.repos, reposError: r.error, papers: p.papers, papersError: p.error };
}

function Authors(props: { authors: Author[] }) {
  const parts: Child[] = [];
  props.authors.forEach((a, i) => {
    const label = a.affiliation ? `${a.name} (${a.affiliation})` : a.name;
    parts.push(i > 0 ? <span>, </span> : null);
    parts.push(<span>{label}</span>);
    if (a.orcid) {
      parts.push(
        <a className="ln" href={`https://orcid.org/${a.orcid}`} target="_blank" rel="noopener" style="color:var(--ocean); border-bottom:1px solid var(--line); margin-left:6px;">
          ORCID {a.orcid}
        </a>,
      );
    }
  });
  return <span>{parts}</span>;
}

function PaperArticle(props: { p: Paper }) {
  const p = props.p;
  return (
    <article style="border-top:1px solid var(--line); padding:36px 0 40px;">
      <div style="font-family:var(--mono); font-size:12px; letter-spacing:.06em; color:var(--granite); margin:0 0 14px;">
        <span style="color:var(--falu);">{p.date}</span>
        <span style="margin:0 10px; color:var(--line);">/</span>
        paper
        {p.citeCount > 0 ? (
          <span>
            <span style="margin:0 10px; color:var(--line);">/</span>
            {String(p.citeCount)} references
          </span>
        ) : null}
      </div>

      <h2 style="font-family:var(--serif); font-weight:600; font-size:29px; line-height:1.18; letter-spacing:-.015em; color:var(--ink); margin:0 0 12px; max-width:34ch;">
        {p.title}
      </h2>

      <p style="font-family:var(--sans); font-size:14px; line-height:1.5; color:var(--granite); margin:0 0 20px;">
        <Authors authors={p.authors} />
      </p>

      <p style="font-family:var(--sans); font-size:15.5px; line-height:1.7; color:var(--ink); margin:0 0 20px; max-width:74ch;">
        {p.abstract}
      </p>

      {p.keywords.length > 0 ? (
        <div style="display:flex; flex-wrap:wrap; gap:8px; margin:0 0 24px;">
          {p.keywords.map((k) => (
            <span style="font-family:var(--mono); font-size:11px; letter-spacing:.02em; color:var(--granite); background:var(--surface); border:1px solid var(--line); border-radius:2px; padding:4px 9px;">
              {k}
            </span>
          ))}
        </div>
      ) : null}

      <div style="display:flex; flex-wrap:wrap; gap:12px; align-items:center;">
        <a className="btn" href={p.pdf} target="_blank" rel="noopener" style="display:inline-flex; align-items:center; gap:9px; font-family:var(--sans); font-weight:500; font-size:14px; padding:11px 20px; border-radius:2px; background:var(--laurel); color:var(--ground);">
          Read the typeset PDF <ArrowIcon size={15} />
        </a>
        <a className="ln" href={p.source} target="_blank" rel="noopener" style="display:inline-flex; align-items:center; gap:8px; font-family:var(--mono); font-size:13px; color:var(--ocean); border-bottom:1px solid var(--line); padding-bottom:2px;">
          Source on GitHub
        </a>
      </div>
    </article>
  );
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

function HeroRosette() {
  // Full-bleed rosette net at true tile scale, densest top-right, fading before the headline.
  return (
    <svg width="100%" height="100%" style="position:absolute; inset:0; width:100%; height:100%; opacity:.5; pointer-events:none;" aria-hidden="true">
      <defs>
        <radialGradient id="fade" cx="100%" cy="0%" r="75%">
          <stop offset="0%" stop-color="#fff" stop-opacity="1" />
          <stop offset="100%" stop-color="#fff" stop-opacity="0" />
        </radialGradient>
        <mask id="fademask">
          <rect width="100%" height="100%" fill="url(#fade)" />
        </mask>
      </defs>
      <rect width="100%" height="100%" fill="url(#rosette)" mask="url(#fademask)" />
    </svg>
  );
}

function Dest(props: { href: string; accent: string; title: string; note?: string; icon: Child }) {
  return (
    <Card href={props.href} tone="surface" style="padding:30px 28px 28px;">
      <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:22px;">
        <span style={`display:inline-flex; align-items:center; justify-content:center; width:40px; height:40px; border-radius:2px; background:var(--ground); color:${props.accent};`}>
          {props.icon}
        </span>
      </div>
      <div style="font-family:var(--serif); font-weight:600; font-size:23px; letter-spacing:-.01em; margin-bottom:6px;">{props.title}</div>
      <div style="font-family:var(--sans); font-size:15px; color:var(--granite); margin-bottom:18px;">{props.note}</div>
      <span style="display:inline-flex; align-items:center; gap:7px; font-family:var(--mono); font-size:12px; color:var(--falu);">Open &rarr;</span>
    </Card>
  );
}

const TrajectoryIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
    <circle cx="4" cy="19" r="1.5" />
    <path d="M5.2 17.6 C7 11 10 9.5 13 10.5" />
    <path d="M13 10.5 C16 9 18.5 7 20.5 4" />
    <path d="M13 10.5 C15 13 18 16 20.5 19" stroke-dasharray="2 3" />
  </svg>
);

const PlanetIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
    <circle cx="12" cy="12" r="4.5" />
    <path d="M3.5 15.5 C1.5 12 6 8.5 12 7.5 C18 6.5 22.5 8 20.5 11" />
    <circle cx="19.25" cy="7.75" r="1.5" />
  </svg>
);

export default function Home(props: { repos?: Repo[]; reposError?: boolean; papers?: Paper[]; papersError?: boolean }) {
  const repos = props.repos ?? [];
  const error = props.reposError ?? false;
  const papers = props.papers ?? [];
  const papersError = props.papersError ?? false;
  const hasPapers = !papersError && papers.length > 0;
  const papersEmpty = !papersError && papers.length === 0;
  const hasRepos = !error && repos.length > 0;
  const isEmpty = !error && repos.length === 0;

  const pinned = PINNED.map((name) => repos.find((r) => r.name === name)).filter(
    (r): r is Repo => r !== undefined,
  );
  const rest = repos.filter((r) => !r.pinned);

  return (
    <Shell active={null}>
      <Band bordered>
        <div style="position:relative; overflow:hidden; padding:96px clamp(20px,5vw,40px) 88px;">
          <HeroRosette />
          <div style="position:relative; max-width:1080px; margin:0 auto;">
            <PageTitle style="margin:0 0 26px;">Noah Hyden<span style="color:var(--falu);">.</span></PageTitle>
            <div style="display:flex; flex-wrap:wrap; gap:14px; align-items:center;">
              <Button href="#projects" variant="outline" size="md">Projects</Button>
              <a href="https://github.com/noahhyden" target="_blank" rel="noopener" aria-label="GitHub" style="display:inline-flex; color:var(--granite);"><GitHubIcon size={26} /></a>
              <a href="https://www.linkedin.com/in/noah-hyden/" target="_blank" rel="noopener" aria-label="LinkedIn" style="display:inline-flex; color:var(--granite);"><LinkedInIcon size={26} /></a>
            </div>
          </div>
        </div>
      </Band>

      <Band bordered id="projects" labelledBy="projects-title">
        <div style="max-width:1080px; margin:0 auto; padding:80px clamp(20px,5vw,40px);">
          <SectionTitle style="margin:18px 0 64px;"><span id="projects-title">Projects</span></SectionTitle>

          {error ? <BuildFetchError title="Couldn&rsquo;t reach GitHub at build time" body="The repository list usually bakes in at build. If it&rsquo;s being stubborn, the projects are all on my profile directly." href="https://github.com/noahhyden?tab=repositories" cta="Open my repositories" /> : null}

          {hasRepos && pinned.length > 0 ? (
            <section style="margin-bottom:56px;">
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
              <p style="font-family:var(--sans); font-size:16px; color:var(--granite); margin:0;">Something went wrong, please notify me via any one of my channels.</p>
            </div>
          ) : null}
        </div>
      </Band>

      <Band bordered id="papers" labelledBy="papers-title">
        <div style="max-width:1080px; margin:0 auto; padding:80px clamp(20px,5vw,40px);">
          <SectionTitle style="margin:0 0 64px;"><span id="papers-title">Papers</span></SectionTitle>
          {papersError ? <BuildFetchError title="Couldn&rsquo;t reach the von-neumann repo at build time" body="The paper list usually bakes in at build. The papers themselves are always live on the project site." href={`${VN_SITE}/#/papers`} cta="Open the papers on vn.noahhyden.com" /> : null}
          {hasPapers ? (
            <div>
              <div style="font-family:var(--mono); font-size:12px; letter-spacing:.06em; color:var(--granite); margin:0 0 4px;">
                {papers.length === 1 ? "1 paper" : `${papers.length} papers`}
              </div>
              {papers.map((p) => <PaperArticle p={p} />)}
              <div style="border-top:1px solid var(--line); padding-top:24px; margin-top:4px;">
                <a href={`${VN_SITE}/#/papers`} target="_blank" rel="noopener" style="display:inline-flex; align-items:center; gap:9px; font-family:var(--sans); font-weight:500; font-size:15px; padding:13px 24px; border-radius:2px; border:1px solid var(--granite); color:var(--ink);">
                  See the papers on vn.noahhyden.com <ArrowIcon size={16} />
                </a>
              </div>
            </div>
          ) : null}
          {papersEmpty ? (
            <div style="border:1px solid var(--line); border-radius:3px; background:var(--surface); padding:40px; text-align:center;">
              <p style="font-family:var(--sans); font-size:16px; color:var(--granite); margin:0;">No papers published yet - check back soon.</p>
            </div>
          ) : null}
        </div>
      </Band>

      <Band>
        <div style="max-width:1080px; margin:0 auto; padding:64px clamp(20px,5vw,40px) 96px;">
          <div style="margin:0 0 22px;"><Eyebrow>Explore</Eyebrow></div>
          <div style="display:grid; grid-template-columns:repeat(auto-fit,minmax(240px,1fr)); gap:20px;">
            <Dest href="/pimas/" accent="var(--laurel)" title="pimas" note="Exact what-if over a live model" icon={<TrajectoryIcon />} />
            <Dest href="/von-neumann/" accent="var(--ocean)" title="von-neumann" note="Self-replicating space manufacturing" icon={<PlanetIcon />} />
          </div>
        </div>
      </Band>
    </Shell>
  );
}
