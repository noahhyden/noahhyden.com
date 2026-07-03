/**
 * Writing - a short LinkedIn-updates page. The freshest activity lives on
 * LinkedIn; real posts are baked in here at build time as they're written
 * (see the Post component and the marked spot below). No fabricated content.
 */
import type { PageMeta } from "../design.js";
import { Shell } from "../components/Shell.js";
import { LinkedInIcon } from "../components/icons.js";

export const meta: PageMeta = {
  path: "/writing/",
  title: "Writing",
  description: "Short notes I post to LinkedIn, plus the occasional paper or article.",
};

const ACTIVITY = "https://www.linkedin.com/in/noah-hyden/recent-activity/all/";

/** One baked-in post. Fill `when` + `body` + optional `url` from a real post. */
function Post(props: { when: string; body: string; url?: string }) {
  return (
    <a href={props.url ?? ACTIVITY} target="_blank" rel="noopener" style="display:block; border:1px solid var(--line); border-radius:3px; background:var(--ground); padding:26px 28px; margin-bottom:18px;">
      <div style="display:flex; align-items:center; gap:10px; font-family:var(--mono); font-size:12px; color:var(--granite); margin-bottom:14px;">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="var(--ocean)"><path d="M4.98 3.5C4.98 4.88 3.87 6 2.5 6S0 4.88 0 3.5 1.12 1 2.5 1s2.48 1.12 2.48 2.5zM.2 8.04h4.6V23H.2V8.04zM8.34 8.04h4.41v2.04h.06c.61-1.16 2.11-2.39 4.35-2.39 4.65 0 5.51 3.06 5.51 7.05V23h-4.6v-6.36c0-1.52-.03-3.47-2.11-3.47-2.12 0-2.44 1.65-2.44 3.36V23h-4.6V8.04z" /></svg>
        <span>Post</span><span>&middot;</span><span>{props.when}</span>
      </div>
      <p style="font-family:var(--serif); font-weight:400; font-size:21px; line-height:1.4; color:var(--ink); margin:0 0 14px;">{props.body}</p>
      <span style="display:inline-flex; align-items:center; gap:7px; font-family:var(--mono); font-size:12px; color:var(--falu);">read on LinkedIn &rarr;</span>
    </a>
  );
}

export default function Writing() {
  return (
    <Shell active="writing">
      <header style="max-width:760px; margin:0 auto; padding:80px 40px 40px;">
        <div style="font-family:var(--mono); font-size:12px; letter-spacing:.18em; text-transform:uppercase; color:var(--granite); margin:0 0 22px;">Writing &amp; updates</div>
        <h1 style="font-family:var(--serif); font-weight:500; font-size:52px; line-height:1.05; letter-spacing:-.022em; margin:0 0 24px; max-width:18ch;">Notes, in the open.</h1>
        <p style="font-family:var(--sans); font-size:17px; line-height:1.6; color:var(--granite); margin:0; max-width:58ch;">Mostly short thoughts I post to LinkedIn, plus the occasional paper or article. The freshest of it always lives on LinkedIn.</p>
      </header>

      <main style="max-width:760px; margin:0 auto; padding:8px 40px 40px;">
        <div style="display:flex; align-items:center; gap:10px; margin:0 0 24px;">
          <h2 style="font-family:var(--serif); font-weight:600; font-size:25px; letter-spacing:-.012em; margin:0;">Updates</h2>
          <span style="font-family:var(--mono); font-size:11px; color:var(--granite); border:1px solid var(--line); border-radius:2px; padding:3px 8px; white-space:nowrap;">from LinkedIn</span>
        </div>

        {/* Real posts get baked in here, newest first, e.g.:
            <Post when="Jun 2026" body="..." url="https://www.linkedin.com/..." />
            Until then, the page sends people to the live LinkedIn activity. */}

        <a href={ACTIVITY} target="_blank" rel="noopener" style="display:inline-flex; align-items:center; gap:9px; font-family:var(--sans); font-weight:500; font-size:15px; padding:13px 22px; border-radius:2px; background:var(--falu); color:var(--ground);"><LinkedInIcon size={17} />See my activity on LinkedIn</a>
      </main>
    </Shell>
  );
}
