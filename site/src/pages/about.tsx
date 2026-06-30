/**
 * About — the long version. Prose + a sticky "at a glance" aside.
 */
import type { PageMeta } from "../design.js";
import { Shell } from "../components/Shell.js";
import { AzulejoBand } from "../components/Azulejo.js";
import { GitHubIcon, LinkedInIcon, ArrowIcon } from "../components/icons.js";

export const meta: PageMeta = {
  path: "/about/",
  title: "About",
  description:
    "Aerospace engineer, roots in Madeira and Sweden. Decide what carries the load, make everything else defer to it.",
};

function Fact(props: { k: string; v: string; accent?: string; last?: boolean }) {
  const border = props.last ? "border-top:1px solid var(--line); border-bottom:1px solid var(--line);" : "border-top:1px solid var(--line);";
  return (
    <div style={`display:flex; justify-content:space-between; padding:10px 0; ${border}`}>
      <dt style="font-family:var(--mono); font-size:12px; color:var(--granite);">{props.k}</dt>
      <dd style={`margin:0; font-family:var(--sans); color:${props.accent ?? "var(--ink)"};`}>{props.v}</dd>
    </div>
  );
}

export default function About() {
  return (
    <Shell active="about">
      <header style="max-width:1080px; margin:0 auto; padding:80px 40px 56px;">
        <div style="font-family:var(--mono); font-size:12px; letter-spacing:.18em; text-transform:uppercase; color:var(--granite); margin:0 0 22px;">About &mdash; the long version</div>
        <h1 style="font-family:var(--serif); font-weight:500; font-size:52px; line-height:1.05; letter-spacing:-.022em; margin:0; max-width:20ch;">I build things that have to hold.</h1>
      </header>

      <main style="max-width:1080px; margin:0 auto; padding:0 40px 40px; display:grid; grid-template-columns:1fr 296px; gap:64px; align-items:start;">
        <article>
          <p style="font-family:var(--sans); font-size:20px; line-height:1.6; color:var(--ink); margin:0 0 28px;">I trained as an aerospace engineer, which is a long way of saying I learned to be honest about loads. A wing doesn&rsquo;t care how clever your drawing is &mdash; it cares whether the structure underneath can carry the day it&rsquo;s asked to.</p>

          <p style="font-family:var(--sans); font-size:16px; line-height:1.68; color:var(--ink); margin:0 0 22px;">That idea has followed me everywhere since. I came up sketching airframes and stress paths, and somewhere along the way I realised the part I loved wasn&rsquo;t the aircraft specifically &mdash; it was the discipline. Decide what carries the load. Make everything else defer to it. Don&rsquo;t decorate a joint you haven&rsquo;t justified.</p>

          <h2 style="font-family:var(--serif); font-weight:600; font-size:25px; letter-spacing:-.012em; margin:44px 0 16px;">Where I&rsquo;m from</h2>
          <p style="font-family:var(--sans); font-size:16px; line-height:1.68; color:var(--ink); margin:0 0 22px;">My roots run between two places that, on paper, have nothing in common: the volcanic rock and laurel forests of <span style="font-style:italic;">Madeira</span>, and the long, low winter light of <span style="font-style:italic;">Sweden</span>. One gave me basalt and the Atlantic; the other gave me snow, timber, and a particular fondness for things made plainly and made to last. If you&rsquo;ve noticed the colours and the tilework on this site &mdash; that&rsquo;s where they come from.</p>

          <h2 style="font-family:var(--serif); font-weight:600; font-size:25px; letter-spacing:-.012em; margin:44px 0 16px;">What I&rsquo;m doing now</h2>
          <p style="font-family:var(--sans); font-size:16px; line-height:1.68; color:var(--ink); margin:0 0 22px;">These days I&rsquo;m heads-down on a company I&rsquo;m not quite ready to talk about. It&rsquo;s early, it&rsquo;s technical, and it has the same bones as everything else I care about: get the structure right and the rest gets easier. When there&rsquo;s something to show, you&rsquo;ll find it under <a href="/projects/" style="color:var(--falu); border-bottom:1px solid var(--falu);">Projects</a> and <a href="/writing/" style="color:var(--falu); border-bottom:1px solid var(--falu);">Writing</a> first.</p>

          <p style="font-family:var(--sans); font-size:16px; line-height:1.68; color:var(--ink); margin:0 0 22px;">In the meantime I keep a handful of things open on GitHub, write the occasional note when I figure something out, and am always glad to compare notes with people building hard things. The fastest way to reach me is LinkedIn.</p>

          <div style="display:flex; flex-wrap:wrap; gap:14px; margin-top:36px;">
            <a href="https://www.linkedin.com/in/noah-hyden/" target="_blank" rel="noopener" style="display:inline-flex; align-items:center; gap:9px; font-family:var(--sans); font-weight:500; font-size:15px; padding:13px 22px; border-radius:2px; background:var(--falu); color:var(--ground);"><LinkedInIcon size={17} />Connect on LinkedIn</a>
            <a href="/projects/" style="display:inline-flex; align-items:center; gap:9px; font-family:var(--sans); font-weight:500; font-size:15px; padding:13px 22px; border-radius:2px; background:transparent; color:var(--ink); border:1px solid var(--granite);">See the work <ArrowIcon /></a>
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
              <Fact k="roots" v="Madeira · Sweden" />
              <Fact k="writes" v="Sometimes" last />
            </dl>
            <div style="font-family:var(--mono); font-size:10px; letter-spacing:.12em; text-transform:uppercase; color:var(--granite); margin:22px 0 12px;">Find me</div>
            <div style="display:flex; flex-direction:column; gap:9px;">
              <a href="https://github.com/noahhyden" target="_blank" rel="noopener" style="display:inline-flex; align-items:center; gap:9px; font-family:var(--mono); font-size:13px; color:var(--ink);"><span style="color:var(--granite); display:inline-flex;"><GitHubIcon size={16} /></span>github.com/noahhyden</a>
              <a href="https://www.linkedin.com/in/noah-hyden/" target="_blank" rel="noopener" style="display:inline-flex; align-items:center; gap:9px; font-family:var(--mono); font-size:13px; color:var(--ink);"><span style="color:var(--granite); display:inline-flex;"><LinkedInIcon size={16} /></span>in/noah-hyden</a>
            </div>
          </div>
        </aside>
      </main>
    </Shell>
  );
}
