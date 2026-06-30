/**
 * Writing — LinkedIn updates feed + a "mentioned in" rail. Content is the same
 * curated set as the hand-built page (the live activity lives on LinkedIn).
 */
import type { PageMeta } from "../design.js";
import { Shell } from "../components/Shell.js";
import { AzulejoBand } from "../components/Azulejo.js";
import { LinkedInIcon } from "../components/icons.js";

export const meta: PageMeta = {
  path: "/writing/",
  title: "Writing",
  description: "Short notes posted to LinkedIn, plus the occasional paper or article — the curated trail.",
};

const ACTIVITY = "https://www.linkedin.com/in/noah-hyden/recent-activity/all/";

function Post(props: { when: string; body: string }) {
  return (
    <a href={ACTIVITY} target="_blank" rel="noopener" style="display:block; border:1px solid var(--line); border-radius:3px; background:var(--ground); padding:26px 28px; margin-bottom:18px;">
      <div style="display:flex; align-items:center; gap:10px; font-family:var(--mono); font-size:12px; color:var(--granite); margin-bottom:14px;">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="var(--ocean)"><path d="M4.98 3.5C4.98 4.88 3.87 6 2.5 6S0 4.88 0 3.5 1.12 1 2.5 1s2.48 1.12 2.48 2.5zM.2 8.04h4.6V23H.2V8.04zM8.34 8.04h4.41v2.04h.06c.61-1.16 2.11-2.39 4.35-2.39 4.65 0 5.51 3.06 5.51 7.05V23h-4.6v-6.36c0-1.52-.03-3.47-2.11-3.47-2.12 0-2.44 1.65-2.44 3.36V23h-4.6V8.04z" /></svg>
        <span>Post</span><span>&middot;</span><span>{props.when}</span>
      </div>
      <p style="font-family:var(--serif); font-weight:400; font-size:21px; line-height:1.4; color:var(--ink); margin:0 0 14px;">{props.body}</p>
      <span style="display:inline-flex; align-items:center; gap:7px; font-family:var(--mono); font-size:12px; color:var(--falu);">read on LinkedIn &rarr;</span>
    </a>
  );
}

function Mention(props: { kind: string; year: string; accent: string; title: string; venue: string; last?: boolean }) {
  const border = props.last
    ? "border-top:1px solid var(--line); border-bottom:1px solid var(--line);"
    : "border-top:1px solid var(--line);";
  return (
    <a href="#" style={`display:block; padding:14px 0; ${border}`}>
      <div style={`font-family:var(--mono); font-size:11px; color:${props.accent}; margin-bottom:5px;`}>{props.kind} &middot; {props.year}</div>
      <div style="font-family:var(--serif); font-weight:600; font-size:16px; line-height:1.3; color:var(--ink); margin-bottom:4px;">{props.title}</div>
      <div style="font-family:var(--sans); font-size:13px; color:var(--granite);">{props.venue}</div>
    </a>
  );
}

export default function Writing() {
  return (
    <Shell active="writing">
      <header style="max-width:1080px; margin:0 auto; padding:80px 40px 40px;">
        <div style="font-family:var(--mono); font-size:12px; letter-spacing:.18em; text-transform:uppercase; color:var(--granite); margin:0 0 22px;">Writing &amp; updates</div>
        <h1 style="font-family:var(--serif); font-weight:500; font-size:52px; line-height:1.05; letter-spacing:-.022em; margin:0 0 24px; max-width:18ch;">Notes, in the open.</h1>
        <p style="font-family:var(--sans); font-size:17px; line-height:1.6; color:var(--granite); margin:0; max-width:58ch;">Mostly short thoughts I post to LinkedIn, plus the occasional paper or article I&rsquo;ve had a hand in. The freshest of it lives on LinkedIn &mdash; this is the curated trail.</p>
      </header>

      <main style="max-width:1080px; margin:0 auto; padding:8px 40px 40px; display:grid; grid-template-columns:1fr 320px; gap:56px; align-items:start;">
        <section>
          <div style="display:flex; align-items:center; gap:10px; margin:0 0 24px;">
            <h2 style="font-family:var(--serif); font-weight:600; font-size:25px; letter-spacing:-.012em; margin:0;">Updates</h2>
            <span style="font-family:var(--mono); font-size:11px; color:var(--granite); border:1px solid var(--line); border-radius:2px; padding:3px 8px; white-space:nowrap;">from LinkedIn</span>
          </div>

          <Post when="recent" body="A short note on getting the structure right before the surface — why the boring scaffolding decides everything that comes after." />
          <Post when="earlier" body="Lessons from running a lot of work in parallel without it turning into chaos — isolation first, merge discipline second." />

          <div style="border:1px dashed var(--line); border-radius:3px; padding:20px 24px; display:flex; gap:12px; align-items:center; background:transparent;">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--granite)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="flex:none;"><circle cx="12" cy="12" r="9" /><line x1="12" y1="11" x2="12" y2="16" /><line x1="12" y1="7.5" x2="12" y2="8" /></svg>
            <p style="font-family:var(--sans); font-size:13.5px; line-height:1.5; color:var(--granite); margin:0;">These two are placeholders &mdash; swap the text and links for your actual posts as you publish. The newest activity always lives on LinkedIn.</p>
          </div>

          <div style="margin-top:24px;">
            <a href={ACTIVITY} target="_blank" rel="noopener" style="display:inline-flex; align-items:center; gap:9px; font-family:var(--sans); font-weight:500; font-size:15px; padding:13px 22px; border-radius:2px; background:var(--falu); color:var(--ground);"><LinkedInIcon size={17} />See all activity on LinkedIn</a>
          </div>
        </section>

        <aside style="position:sticky; top:96px;">
          <div style="border:1px solid var(--line); border-radius:3px; background:var(--ground); overflow:hidden;">
            <div style="height:72px; background:var(--surface); position:relative; overflow:hidden; border-bottom:1px solid var(--line);">
              <AzulejoBand height={72} opacity={0.42} />
            </div>
            <div style="padding:22px 24px 24px;">
              <div style="font-family:var(--mono); font-size:10px; letter-spacing:.12em; text-transform:uppercase; color:var(--granite); margin:0 0 6px;">Mentioned in</div>
              <p style="font-family:var(--sans); font-size:13px; line-height:1.5; color:var(--granite); margin:0 0 16px;">Papers &amp; articles I&rsquo;ve contributed to or been cited in.</p>

              <Mention kind="paper" year="2025" accent="var(--ocean)" title="Title of a paper you&rsquo;re credited on" venue="Journal / venue — add link" />
              <Mention kind="article" year="2024" accent="var(--falu)" title="A piece that quoted or featured you" venue="Publication — add link" last />

              <p style="font-family:var(--sans); font-size:12.5px; line-height:1.5; color:var(--granite); margin:16px 0 0; font-style:italic;">Placeholders &mdash; replace with real mentions, or remove this rail until you have one.</p>
            </div>
          </div>
        </aside>
      </main>
    </Shell>
  );
}
