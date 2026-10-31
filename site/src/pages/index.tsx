import type { Child } from "pimas-ui/dom";
import type { PageMeta } from "../design.js";
import { Shell } from "../components/Shell.js";
import { AzulejoBand } from "../components/Azulejo.js";
import { GitHubIcon, LinkedInIcon } from "../components/icons.js";
import { Band, Eyebrow, PageTitle, SectionTitle, Card, Button } from "../components/primitives.js";

export const meta: PageMeta = {
  path: "/",
  title: "Noah Hyden",
  description:
    "Noah Hyden - aerospace engineer in Stockholm. Airframes, software, and pimas: a reactive UI engine an AI agent can simulate against before it acts.",
};

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

const GridIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
    <rect x="4" y="4" width="6.5" height="6.5" rx="1" />
    <rect x="13.5" y="4" width="6.5" height="6.5" rx="1" />
    <rect x="4" y="13.5" width="6.5" height="6.5" rx="1" />
    <rect x="13.5" y="13.5" width="6.5" height="6.5" rx="1" />
  </svg>
);

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

export default function Home() {
  return (
    <Shell active={null}>
      {/* HERO */}
      <Band bordered>
        <div style="position:relative; overflow:hidden; padding:96px clamp(20px,5vw,40px) 88px;">
          <HeroRosette />
          <div style="position:relative; max-width:1080px; margin:0 auto;">
            <div style="margin:0 0 22px;"><Eyebrow>Aerospace engineer</Eyebrow></div>
            <PageTitle style="margin:0 0 26px;">Noah Hyden<span style="color:var(--falu);">.</span></PageTitle>
            <p style="font-family:var(--sans); font-size:19px; line-height:1.6; color:var(--ink); margin:0 0 36px; max-width:56ch;">I work on airframes and software.</p>
            <div style="display:flex; flex-wrap:wrap; gap:14px; align-items:center;">
              <Button href="#about" variant="accent" size="md">More about me</Button>
              <Button href="/projects/" variant="outline" size="md">Projects</Button>
            </div>
          </div>
        </div>
      </Band>

      {/* ABOUT */}
      <Band bordered tint id="about" labelledBy="about-title">
        <div className="about-grid" style="max-width:1080px; margin:0 auto; padding:80px clamp(20px,5vw,40px); display:grid; grid-template-columns:1fr 296px; gap:64px; align-items:start;">
          <article>
            <div style="margin:0 0 18px;"><Eyebrow>About</Eyebrow></div>
            <SectionTitle style="margin:0 0 26px;"><span id="about-title">I trained as an aerospace engineer.</span></SectionTitle>
            <p style="font-family:var(--sans); font-size:18px; line-height:1.6; color:var(--ink); margin:0 0 14px;">My family is from <span style="font-style:italic;">Madeira</span> and <span style="font-style:italic;">Sweden</span>.</p>
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
                <Fact k="roots" v="Madeira &middot; Sweden" last />
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

      {/* DESTINATIONS */}
      <Band>
        <div style="max-width:1080px; margin:0 auto; padding:64px clamp(20px,5vw,40px) 96px;">
          <div style="margin:0 0 22px;"><Eyebrow>Explore</Eyebrow></div>
          <div style="display:grid; grid-template-columns:repeat(auto-fit,minmax(240px,1fr)); gap:20px;">
            <Dest href="/pimas/" n="01" accent="var(--laurel)" title="pimas" note="Reactive UI engine" icon={<GraphIcon />} />
            <Dest href="/projects/" n="02" accent="var(--ocean)" title="Projects" note="Open source" icon={<GridIcon />} />
            <Dest href="/papers/" n="03" accent="var(--falu)" title="Papers" note="Working papers" icon={<PageIcon />} />
          </div>
        </div>
      </Band>
    </Shell>
  );
}
