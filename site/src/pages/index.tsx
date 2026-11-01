import type { Child } from "pimas-ui/dom";
import type { PageMeta } from "../design.js";
import { Shell } from "../components/Shell.js";
import { AzulejoBand } from "../components/Azulejo.js";
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
    console.error("home: GitHub fetch failed -", e instanceof Error ? e.message : e);
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

function HeroRosette() {
  // Home-only variant: the rosette net faded out with a radial mask, top-right.
  return (
    <svg width="420" height="420" viewBox="0 0 420 420" style="position:absolute; top:-40px; right:-80px; opacity:.6; pointer-events:none;" aria-hidden="true">
      <defs>
        <radialGradient id="fade" cx="70%" cy="30%" r="75%">
          <stop offset="0%" stop-color="#fff" stop-opacity="1" />
          <stop offset="100%" stop-color="#fff" stop-opacity="0" />
        </radialGradient>
        <mask id="fademask">
          <rect width="420" height="420" fill="url(#fade)" />
        </mask>
      </defs>
      <rect width="420" height="420" fill="url(#rosette)" mask="url(#fademask)" />
    </svg>
  );
}

function Dest(props: { href: string; n: string; accent: string; title: string; note?: string; icon: Child }) {
  return (
    <Card href={props.href} tone="surface" style="padding:30px 28px 28px;">
      <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:22px;">
        <span style={`display:inline-flex; align-items:center; justify-content:center; width:40px; height:40px; border-radius:2px; background:var(--ground); color:${props.accent};`}>
          {props.icon}
        </span>
        <span style="font-family:var(--mono); font-size:11px; color:var(--granite);">{props.n}</span>
      </div>
      <div style="font-family:var(--serif); font-weight:600; font-size:23px; letter-spacing:-.01em; margin-bottom:6px;">{props.title}</div>
      <div style="font-family:var(--sans); font-size:15px; color:var(--granite); margin-bottom:18px;">{props.note}</div>
      <span style="display:inline-flex; align-items:center; gap:7px; font-family:var(--mono); font-size:12px; color:var(--falu);">Open &rarr;</span>
    </Card>
  );
}

const GraphIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
    <circle cx="6" cy="6" r="2.5" />
    <circle cx="18" cy="7" r="2.5" />
    <circle cx="11" cy="18" r="2.5" />
    <path d="M8.1 7.4 L9 16" />
    <path d="M8.3 6.2 L15.6 6.7" />
    <path d="M16.4 9 L12.6 15.9" />
  </svg>
);

const PageIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
    <path d="M6 3 h8 l4 4 v14 H6 Z" />
    <path d="M14 3 v4 h4" />
    <path d="M9 12 h6" />
    <path d="M9 15.5 h6" />
    <path d="M9 8.5 h2.5" />
  </svg>
);

function Fact(props: { k: string; v: string; accent?: string; last?: boolean }) {
  const border = props.last ? "border-top:1px solid var(--line); border-bottom:1px solid var(--line);" : "border-top:1px solid var(--line);";
  return (
    <div style={`display:flex; justify-content:space-between; padding:10px 0; ${border}`}>
      <dt style="font-family:var(--mono); font-size:12px; color:var(--granite);">{props.k}</dt>
      <dd style={`margin:0; font-family:var(--sans); color:${props.accent ?? "var(--ink)"};`}>{props.v}</dd>
    </div>
  );
}

export default function Home(props: { repos?: Repo[]; error?: boolean }) {
  const repos = props.repos ?? [];
  const error = props.error ?? false;
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
            <div style="margin:0 0 22px;"><Eyebrow>Aerospace engineer</Eyebrow></div>
            <PageTitle style="margin:0 0 26px;">Noah Hyden<span style="color:var(--falu);">.</span></PageTitle>
            <p style="font-family:var(--sans); font-size:19px; line-height:1.6; color:var(--ink); margin:0 0 36px; max-width:56ch;">I work on airframes and software.</p>
            <div style="display:flex; flex-wrap:wrap; gap:14px; align-items:center;">
              <Button href="#about" variant="accent" size="md">More about me</Button>
              <Button href="#projects" variant="outline" size="md">Projects</Button>
            </div>
          </div>
        </div>
      </Band>

      <Band bordered tint id="about" labelledBy="about-title">
        <div className="about-grid" style="max-width:1080px; margin:0 auto; padding:80px clamp(20px,5vw,40px); display:grid; grid-template-columns:1fr 296px; gap:64px; align-items:start;">
          <article>
            <div style="margin:0 0 18px;"><Eyebrow>About</Eyebrow></div>
            <SectionTitle style="margin:0 0 26px;"><span id="about-title">I trained as an aerospace engineer.</span></SectionTitle>
            <p style="font-family:var(--sans); font-size:18px; line-height:1.6; color:var(--ink); margin:0;">I&rsquo;m building an early-stage company in procurement intelligence.</p>
          </article>

          <aside style="position:sticky; top:96px; border:1px solid var(--line); border-radius:3px; background:var(--ground); overflow:hidden;">
            <div style="height:84px; background:var(--surface); position:relative; overflow:hidden; border-bottom:1px solid var(--line);">
              <AzulejoBand height={84} opacity={0.42} />
            </div>
            <div style="padding:22px 24px 24px;">
              <div style="font-family:var(--mono); font-size:10px; letter-spacing:.12em; text-transform:uppercase; color:var(--granite); margin:0 0 16px;">At a glance</div>
              <dl style="margin:0; font-size:14px;">
                <Fact k="degree" v="B.Sc. Aerospace Eng." />
                <Fact k="location" v="Stockholm, SE" />
              </dl>
              <div style="font-family:var(--mono); font-size:10px; letter-spacing:.12em; text-transform:uppercase; color:var(--granite); margin:22px 0 12px;">Find me</div>
              <div style="display:flex; flex-direction:column; gap:9px;">
                <a href="https://github.com/noahhyden" target="_blank" rel="noopener" style="display:inline-flex; align-items:center; gap:9px; font-family:var(--mono); font-size:13px; color:var(--ink);"><span style="color:var(--granite); display:inline-flex;"><GitHubIcon size={16} /></span>github.com/noahhyden</a>
                <a href="https://www.linkedin.com/in/noah-hyden/" target="_blank" rel="noopener" style="display:inline-flex; align-items:center; gap:9px; font-family:var(--mono); font-size:13px; color:var(--ink);"><span style="color:var(--granite); display:inline-flex;"><LinkedInIcon size={16} /></span>in/noah-hyden</a>
              </div>
            </div>
          </aside>
        </div>
      </Band>

      <Band bordered id="projects" labelledBy="projects-title">
        <div style="max-width:1080px; margin:0 auto; padding:80px clamp(20px,5vw,40px);">
          <div style="display:flex; align-items:baseline; justify-content:space-between; flex-wrap:wrap; gap:12px;">
            <Eyebrow>Projects - baked in from GitHub</Eyebrow>
            <a href="https://github.com/noahhyden" target="_blank" rel="noopener" style="display:inline-flex; align-items:center; gap:8px; font-family:var(--mono); font-size:13px; color:var(--falu); border-bottom:1px solid var(--falu); padding-bottom:2px;">@noahhyden on GitHub &rarr;</a>
          </div>
          <SectionTitle style="margin:18px 0 0;"><span id="projects-title">What I&rsquo;ve been building.</span></SectionTitle>
          <p style="font-family:var(--sans); font-size:17px; line-height:1.6; color:var(--granite); margin:24px 0 40px; max-width:58ch;">Pulled from my public repositories at build time. A few pinned highlights first, then everything else, most recently pushed first. Some are finished, some are experiments.</p>

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
        </div>
      </Band>

      <Band>
        <div style="max-width:1080px; margin:0 auto; padding:64px clamp(20px,5vw,40px) 96px;">
          <div style="margin:0 0 22px;"><Eyebrow>Explore</Eyebrow></div>
          <div style="display:grid; grid-template-columns:repeat(auto-fit,minmax(240px,1fr)); gap:20px;">
            <Dest href="/pimas/" n="01" accent="var(--laurel)" title="pimas" note="Reactive UI engine" icon={<GraphIcon />} />
            <Dest href="/papers/" n="02" accent="var(--falu)" title="Papers" note="Working papers" icon={<PageIcon />} />
          </div>
        </div>
      </Band>
    </Shell>
  );
}
