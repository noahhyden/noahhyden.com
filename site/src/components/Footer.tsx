/**
 * The site footer + the honest "powered by pimas" metrics band.
 *
 * The numbers are build-injected (see TOKENS / build.mjs) and deliberately the
 * defensible ones: JavaScript actually shipped to this page (0 - the React/Babel
 * runtime is gone), gzipped HTML weight, prerender time, pimas version. No browser
 * RAM (theater). External requests are reported honestly - fonts are the one
 * remaining external origin, and we say so rather than claim a false zero.
 *
 * This band exists on purpose: it's an anti-bloat incentive. If a number gets
 * ugly, it's meant to be uncomfortable.
 */
import { TOKENS } from "../design.js";
import { GitHubIcon, LinkedInIcon } from "./icons.js";
import { AzulejoBand } from "./Azulejo.js";

export function Footer() {
  return (
    <footer style="position:relative; overflow:hidden; border-top:1px solid var(--line); background:var(--surface); margin-top:40px;">
      <AzulejoBand height={120} opacity={0.28} pattern="quatrefoil" />

      <div style="position:relative; max-width:1080px; margin:0 auto; padding:56px 40px; display:flex; flex-wrap:wrap; gap:32px; justify-content:space-between; align-items:flex-end;">
        <div>
          <div style="font-family:var(--serif); font-weight:600; font-size:21px; letter-spacing:-.01em; margin-bottom:10px;">
            Noah Hyden<span style="color:var(--falu);">.</span>
          </div>
          <p style="font-family:var(--sans); font-size:14px; line-height:1.55; color:var(--granite); margin:0; max-width:42ch;">
            Aerospace engineer. Building quietly. Happy to talk shop - reach me on LinkedIn.
          </p>
        </div>
        <div style="display:flex; gap:14px;">
          <a href="https://github.com/noahhyden" target="_blank" rel="noopener" style="display:inline-flex; align-items:center; gap:9px; font-family:var(--sans); font-weight:500; font-size:14px; padding:11px 18px; border-radius:2px; border:1px solid var(--granite); color:var(--ink);">
            <GitHubIcon size={17} />GitHub
          </a>
          <a href="https://www.linkedin.com/in/noah-hyden/" target="_blank" rel="noopener" style="display:inline-flex; align-items:center; gap:9px; font-family:var(--sans); font-weight:500; font-size:14px; padding:11px 18px; border-radius:2px; background:var(--falu); color:var(--ground);">
            <LinkedInIcon size={17} />LinkedIn
          </a>
        </div>
      </div>

      {/* ── honest pimas metrics band ───────────────────────────────────── */}
      <div style="position:relative; border-top:1px solid var(--line); background:rgba(23,30,26,.025);">
        <div style="max-width:1080px; margin:0 auto; padding:22px 40px; font-family:var(--mono); font-size:11px; line-height:1.7; color:var(--granite);">
          <div style="letter-spacing:.14em; text-transform:uppercase; color:var(--laurel); margin-bottom:8px;">
            Built with <a href="/pimas/" style="color:var(--laurel); border-bottom:1px solid var(--laurel);">pimas</a> - no React, no virtual DOM, no in-browser transpiler
          </div>
          <div style="display:flex; flex-wrap:wrap; gap:6px 18px;">
            <span><strong style="color:var(--ink); font-weight:500;">{TOKENS.jsBytes} KB</strong> JavaScript shipped</span>
            <span><strong style="color:var(--ink); font-weight:500;">{TOKENS.htmlKb} KB</strong> HTML (gzip)</span>
            <span><strong style="color:var(--ink); font-weight:500;">0</strong> external requests</span>
            <span>prerendered in <strong style="color:var(--ink); font-weight:500;">{TOKENS.renderMs} ms</strong></span>
            <span>0 wasted re-renders <span style="color:var(--granite);">(fine-grained - no diff pass)</span></span>
            <span>pimas <strong style="color:var(--ink); font-weight:500;">v{TOKENS.pimasVer}</strong></span>
          </div>
          <div style="margin-top:6px; color:var(--granite);">
            Everything is inlined, static, and same-origin - HTML, CSS, SVG, and self-hosted fonts (Spectral &amp; IBM Plex, OFL). No CDN, no third party, nothing to phone home.
          </div>
        </div>
      </div>

      <div style="position:relative; border-top:1px solid var(--line);">
        <div style="max-width:1080px; margin:0 auto; padding:16px 40px; display:flex; justify-content:space-between; font-family:var(--mono); font-size:11px; color:var(--granite);">
          <span>&copy; 2026 Noah Hyden</span>
          <a href="/pimas/" style="color:var(--granite);">how this site was built</a>
        </div>
      </div>
    </footer>
  );
}
