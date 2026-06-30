/**
 * Home. Ported faithfully from the hand-built index.html — hero with the faded
 * rosette net, three section cards, the "principle" line — now composed from
 * shared components instead of one 145-line slab of inline markup.
 */
import type { Child } from "pimas/dom";
import type { PageMeta } from "../design.js";
import { Shell } from "../components/Shell.js";
import { ArrowIcon } from "../components/icons.js";

export const meta: PageMeta = {
  path: "/",
  title: "Noah Hyden",
  description:
    "Aerospace engineer drawn to structure — airframes, software, and the odd sentence. Currently heads-down on something new.",
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

const PersonIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
    <circle cx="12" cy="8" r="4" />
    <path d="M5 21c0-3.87 3.13-7 7-7s7 3.13 7 7" />
  </svg>
);
const GridIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
    <rect x="4" y="4" width="6.5" height="6.5" rx="1" />
    <rect x="13.5" y="4" width="6.5" height="6.5" rx="1" />
    <rect x="4" y="13.5" width="6.5" height="6.5" rx="1" />
    <rect x="13.5" y="13.5" width="6.5" height="6.5" rx="1" />
  </svg>
);
const DocIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
    <path d="M6 3h8l4 4v14H6z" />
    <polyline points="14,3 14,7 18,7" />
    <line x1="9" y1="13" x2="15" y2="13" />
    <line x1="9" y1="17" x2="13" y2="17" />
  </svg>
);

export default function Home() {
  return (
    <Shell active={null}>
      {/* HERO */}
      <header style="position:relative; overflow:hidden; padding:96px 40px 88px; border-bottom:1px solid var(--line);">
        <HeroRosette />
        <div style="position:relative; max-width:1080px; margin:0 auto;">
          <div style="font-family:var(--mono); font-size:12px; letter-spacing:.18em; text-transform:uppercase; color:var(--granite); margin:0 0 22px;">Aerospace engineer &middot; lat 32.7&deg; N</div>
          <h1 style="font-family:var(--serif); font-weight:500; font-size:62px; line-height:1.02; letter-spacing:-.022em; color:var(--ink); margin:0 0 26px; max-width:15ch;">Hewn from basalt, drawn to <span style="font-style:italic;">structure</span>.</h1>
          <p style="font-family:var(--sans); font-size:19px; line-height:1.6; color:var(--ink); margin:0 0 36px; max-width:58ch;">I&rsquo;m Noah &mdash; an aerospace engineer who never quite stopped building. I like things that hold load honestly: airframes, software, the odd sentence. These days I&rsquo;m heads-down on something I&rsquo;m not ready to name yet.</p>
          <div style="display:flex; flex-wrap:wrap; gap:14px; align-items:center;">
            <a href="/about/" style="display:inline-flex; align-items:center; gap:9px; font-family:var(--sans); font-weight:500; font-size:15px; padding:13px 22px; border-radius:2px; background:var(--laurel); color:var(--ground); white-space:nowrap;">Read my story <ArrowIcon /></a>
            <a href="/projects/" style="display:inline-flex; align-items:center; font-family:var(--sans); font-weight:500; font-size:15px; padding:13px 22px; border-radius:2px; background:transparent; color:var(--ink); border:1px solid var(--granite); white-space:nowrap;">See what I&rsquo;ve built</a>
          </div>
        </div>
      </header>

      {/* SECTION PREVIEWS */}
      <main style="max-width:1080px; margin:0 auto; padding:80px 40px 0;">
        <div style="display:grid; grid-template-columns:repeat(3,1fr); gap:20px;">
          <Card href="/about/" n="01" accent="var(--laurel)" title="About" cta="read"
            body="Where I come from, what I trained in, and why structure runs through all of it." icon={<PersonIcon />} />
          <Card href="/projects/" n="02" accent="var(--ocean)" title="Projects" cta="browse"
            body="Open-source work, pulled live from GitHub — tools, experiments, and the occasional rabbit hole." icon={<GridIcon />} />
          <Card href="/writing/" n="03" accent="var(--falu)" title="Writing" cta="latest"
            body="Notes and updates, posts from LinkedIn, and papers or articles I’ve had a hand in." icon={<DocIcon />} />
        </div>

        <section style="margin:80px 0; padding:48px 0; border-top:1px solid var(--line); border-bottom:1px solid var(--line);">
          <div style="display:grid; grid-template-columns:172px 1fr; gap:28px; align-items:start;">
            <div style="font-family:var(--mono); font-size:11px; letter-spacing:.12em; text-transform:uppercase; color:var(--granite); padding-top:8px;">A principle</div>
            <blockquote style="margin:0;">
              <p style="font-family:var(--serif); font-style:italic; font-weight:400; font-size:30px; line-height:1.35; color:var(--ink); margin:0; max-width:30ch;">Structure first; the surface only has to be honest about it.</p>
            </blockquote>
          </div>
        </section>
      </main>
    </Shell>
  );
}
