/**
 * Home - the single landing page. Hero, the merged About (prose + an "at a
 * glance" aside), and a link out to Projects. The old /about/ route is folded in
 * here; the nav "About" now jumps to #about.
 */
import type { Child } from "pimas-ui/dom";
import type { PageMeta } from "../design.js";
import { Shell } from "../components/Shell.js";
import { AzulejoBand } from "../components/Azulejo.js";
import { ArrowIcon, GitHubIcon, LinkedInIcon } from "../components/icons.js";

export const meta: PageMeta = {
  path: "/",
  title: "Noah Hyden",
  description:
    "Noah Hyden, aerospace engineer. Airframes, software, and an early-stage company I'm not ready to name yet.",
};

function HeroRosette() {
  // Home-only variant: the rosette net faded out with a radial mask, top-right.
  return (
    <svg width="420" height="420" viewBox="0 0 420 420" style="position:absolute; top:-40px; right:-80px; opacity:.5; pointer-events:none;" aria-hidden="true">
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

function Card(props: { href: string; n: string; accent: string; title: string; body: string; cta: string; icon: Child }) {
  return (
    <a href={props.href} style="display:block; border:1px solid var(--line); border-radius:3px; background:var(--ground); padding:30px 28px 28px;">
      <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:22px;">
        <span style={`display:inline-flex; align-items:center; justify-content:center; width:40px; height:40px; border-radius:2px; background:var(--surface); color:${props.accent};`}>
          {props.icon}
        </span>
        <span style="font-family:var(--mono); font-size:11px; color:var(--granite);">{props.n}</span>
      </div>
      <div style="font-family:var(--serif); font-weight:600; font-size:23px; letter-spacing:-.01em; margin-bottom:9px;">{props.title}</div>
      <p style="font-family:var(--sans); font-size:15px; line-height:1.55; color:var(--granite); margin:0 0 18px;">{props.body}</p>
      <span style="display:inline-flex; align-items:center; gap:7px; font-family:var(--mono); font-size:12px; color:var(--falu);">{props.cta} &rarr;</span>
    </a>
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
      <header style="position:relative; overflow:hidden; padding:96px 40px 88px; border-bottom:1px solid var(--line);">
        <HeroRosette />
        <div style="position:relative; max-width:1080px; margin:0 auto;">
          <div style="font-family:var(--mono); font-size:12px; letter-spacing:.18em; text-transform:uppercase; color:var(--granite); margin:0 0 22px;">Aerospace engineer</div>
          <h1 style="font-family:var(--serif); font-weight:500; font-size:76px; line-height:1.0; letter-spacing:-.025em; color:var(--ink); margin:0 0 26px;">Noah Hyden<span style="color:var(--falu);">.</span></h1>
          <p style="font-family:var(--sans); font-size:19px; line-height:1.6; color:var(--ink); margin:0 0 36px; max-width:56ch;">I trained as an aerospace engineer. I work on airframes and software, and I&rsquo;m building an early-stage company I&rsquo;m not ready to talk about yet.</p>
          <div style="display:flex; flex-wrap:wrap; gap:14px; align-items:center;">
            <a href="#about" style="display:inline-flex; align-items:center; gap:9px; font-family:var(--sans); font-weight:500; font-size:15px; padding:13px 22px; border-radius:2px; background:var(--laurel); color:var(--ground); white-space:nowrap;">More about me <ArrowIcon /></a>
            <a href="/projects/" style="display:inline-flex; align-items:center; font-family:var(--sans); font-weight:500; font-size:15px; padding:13px 22px; border-radius:2px; background:transparent; color:var(--ink); border:1px solid var(--granite); white-space:nowrap;">Projects</a>
          </div>
        </div>
      </header>

      {/* ABOUT - merged from the old /about/ page */}
      <section id="about" style="max-width:1080px; margin:0 auto; padding:80px 40px 8px; display:grid; grid-template-columns:1fr 296px; gap:64px; align-items:start;">
        <article>
          <div style="font-family:var(--mono); font-size:12px; letter-spacing:.18em; text-transform:uppercase; color:var(--granite); margin:0 0 18px;">About</div>
          <h2 style="font-family:var(--serif); font-weight:500; font-size:44px; line-height:1.06; letter-spacing:-.022em; margin:0 0 26px; max-width:18ch;">I trained as an aerospace engineer.</h2>

          <p style="font-family:var(--sans); font-size:20px; line-height:1.6; color:var(--ink); margin:0 0 28px;">I started on airframes and stress paths. What stuck wasn&rsquo;t aircraft in particular; it was the way of working: figure out what carries the load, make everything else defer to it, and don&rsquo;t add a part you can&rsquo;t justify.</p>

          <p style="font-family:var(--sans); font-size:16px; line-height:1.68; color:var(--ink); margin:0 0 22px;">I&rsquo;ve spent most of my time since on software, and I approach it the same way.</p>

          <h3 style="font-family:var(--serif); font-weight:600; font-size:25px; letter-spacing:-.012em; margin:44px 0 16px;">Where I&rsquo;m from</h3>
          <p style="font-family:var(--sans); font-size:16px; line-height:1.68; color:var(--ink); margin:0 0 22px;">My family is from <span style="font-style:italic;">Madeira</span> and <span style="font-style:italic;">Sweden</span>. The colours and tilework on this site come from there: the basalt and laurel green of Madeira, and one Swedish red.</p>

          <h3 style="font-family:var(--serif); font-weight:600; font-size:25px; letter-spacing:-.012em; margin:44px 0 16px;">What I&rsquo;m doing now</h3>
          <p style="font-family:var(--sans); font-size:16px; line-height:1.68; color:var(--ink); margin:0 0 22px;">I&rsquo;m building an early-stage company I&rsquo;m not ready to talk about yet. It&rsquo;s technical and it&rsquo;s early. When there&rsquo;s something to show, it&rsquo;ll turn up under <a href="/projects/" style="color:var(--falu); border-bottom:1px solid var(--falu);">Projects</a> first.</p>

          <p style="font-family:var(--sans); font-size:16px; line-height:1.68; color:var(--ink); margin:0 0 22px;">Otherwise I keep some things public on GitHub and write occasionally. LinkedIn is the fastest way to reach me.</p>

          <div style="display:flex; flex-wrap:wrap; gap:14px; margin-top:36px;">
            <a href="https://www.linkedin.com/in/noah-hyden/" target="_blank" rel="noopener" style="display:inline-flex; align-items:center; gap:9px; font-family:var(--sans); font-weight:500; font-size:15px; padding:13px 22px; border-radius:2px; background:var(--falu); color:var(--ground);"><LinkedInIcon size={17} />Connect on LinkedIn</a>
            <a href="/projects/" style="display:inline-flex; align-items:center; gap:9px; font-family:var(--sans); font-weight:500; font-size:15px; padding:13px 22px; border-radius:2px; background:transparent; color:var(--ink); border:1px solid var(--granite);">Projects <ArrowIcon /></a>
          </div>
        </article>

        <aside style="position:sticky; top:96px; border:1px solid var(--line); border-radius:3px; background:var(--ground); overflow:hidden;">
          <div style="height:84px; background:var(--surface); position:relative; overflow:hidden; border-bottom:1px solid var(--line);">
            <AzulejoBand height={84} opacity={0.42} />
          </div>
          <div style="padding:22px 24px 24px;">
            <div style="font-family:var(--mono); font-size:10px; letter-spacing:.12em; text-transform:uppercase; color:var(--granite); margin:0 0 16px;">At a glance</div>
            <dl style="margin:0; font-size:14px;">
              <Fact k="field" v="Aerospace eng." />
              <Fact k="now" v="Stealth" accent="var(--falu)" />
              <Fact k="roots" v="Madeira &middot; Sweden" />
              <Fact k="writes" v="Sometimes" last />
            </dl>
            <div style="font-family:var(--mono); font-size:10px; letter-spacing:.12em; text-transform:uppercase; color:var(--granite); margin:22px 0 12px;">Find me</div>
            <div style="display:flex; flex-direction:column; gap:9px;">
              <a href="https://github.com/noahhyden" target="_blank" rel="noopener" style="display:inline-flex; align-items:center; gap:9px; font-family:var(--mono); font-size:13px; color:var(--ink);"><span style="color:var(--granite); display:inline-flex;"><GitHubIcon size={16} /></span>github.com/noahhyden</a>
              <a href="https://www.linkedin.com/in/noah-hyden/" target="_blank" rel="noopener" style="display:inline-flex; align-items:center; gap:9px; font-family:var(--mono); font-size:13px; color:var(--ink);"><span style="color:var(--granite); display:inline-flex;"><LinkedInIcon size={16} /></span>in/noah-hyden</a>
            </div>
          </div>
        </aside>
      </section>

      {/* WHERE TO NEXT + PRINCIPLE */}
      <main style="max-width:1080px; margin:0 auto; padding:64px 40px 0;">
        <div style="max-width:520px;">
          <Card href="/projects/" n="01" accent="var(--ocean)" title="Projects" cta="browse"
            body="Open-source work, pulled from GitHub: tools and experiments." icon={<GridIcon />} />
        </div>

        <div style="margin:64px 0;"></div>
      </main>
    </Shell>
  );
}
