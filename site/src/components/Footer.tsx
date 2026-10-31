/**
 * The site footer + the honest "powered by pimas" metrics band.
 *
 * The numbers are build-injected (see TOKENS / build.mjs) and deliberately the
 * defensible ones: JavaScript actually shipped to this page (0 - the React/Babel
 * runtime is gone), gzipped HTML weight, prerender time, pimas version. No browser
 * RAM (theater). External requests are reported honestly - fonts are the one
 * remaining external origin, and we say so rather than claim a false zero.
 *
 * Layout follows the klarum footer: brand column + link columns (Work,
 * Elsewhere), the metrics band, then a stacked mono legal line.
 *
 * This band exists on purpose: it's an anti-bloat incentive. If a number gets
 * ugly, it's meant to be uncomfortable.
 */
import { TOKENS } from "../design.js";
import { AzulejoBand } from "./Azulejo.js";

const HEAD = "font-family:var(--mono); font-size:11px; letter-spacing:.18em; text-transform:uppercase; color:var(--granite); margin-bottom:14px;";
const LIST = "list-style:none; margin:0; padding:0; display:flex; flex-direction:column; gap:10px;";
const ITEM = "font-family:var(--sans); font-size:14px; color:var(--ink);";

export function Footer() {
  return (
    <footer style="position:relative; overflow:hidden; border-top:1px solid var(--line); background:var(--surface); margin-top:40px;">
      <AzulejoBand height={120} opacity={0.28} pattern="quatrefoil" />

      <div style="position:relative; max-width:1080px; margin:0 auto; padding:56px 40px; display:grid; grid-template-columns:repeat(auto-fit, minmax(160px, 1fr)); gap:32px 40px;">
        <div style="grid-column:span 2; min-width:220px;">
          <div style="font-family:var(--serif); font-weight:600; font-size:21px; letter-spacing:-.01em; margin-bottom:10px;">
            Noah Hyden<span style="color:var(--falu);">.</span>
          </div>
          <p style="font-family:var(--sans); font-size:14px; line-height:1.55; color:var(--granite); margin:0; max-width:42ch;">
            Aerospace engineer in Stockholm.
          </p>
        </div>
        <div>
          <div style={HEAD}>Work</div>
          <ul style={LIST}>
            <li><a href="/pimas/" class="ln" style={ITEM}>pimas</a></li>
            <li><a href="/projects/" class="ln" style={ITEM}>Projects</a></li>
            <li><a href="/papers/" class="ln" style={ITEM}>Papers</a></li>
          </ul>
        </div>
        <div>
          <div style={HEAD}>Elsewhere</div>
          <ul style={LIST}>
            <li><a href="https://github.com/noahhyden" target="_blank" rel="noopener" class="ln" style={ITEM}>GitHub</a></li>
            <li><a href="https://www.linkedin.com/in/noah-hyden/" target="_blank" rel="noopener" class="ln" style={ITEM}>LinkedIn</a></li>
          </ul>
        </div>
      </div>

      {/* ── honest pimas metrics band ───────────────────────────────────── */}
      <div style="position:relative; border-top:1px solid var(--line); background:var(--footer-tint);">
        <div style="max-width:1080px; margin:0 auto; padding:22px 40px; font-family:var(--mono); font-size:11px; line-height:1.7; color:var(--granite);">
          <div style="letter-spacing:.14em; text-transform:uppercase; color:var(--laurel); margin-bottom:8px;">
            Built with <a href="/pimas/" style="color:var(--laurel); border-bottom:1px solid var(--laurel);">pimas</a> - no React, no virtual DOM, no in-browser transpiler
          </div>
          <div style="display:flex; flex-wrap:wrap; gap:6px 18px;">
            <span><strong style="color:var(--ink); font-weight:500;">{TOKENS.jsBytes} KB</strong> framework JS</span>
            <span><strong style="color:var(--ink); font-weight:500;">{TOKENS.themeJs} KB</strong> inline theme toggle</span>
            <span><strong style="color:var(--ink); font-weight:500;">{TOKENS.htmlKb} KB</strong> HTML (gzip)</span>
            <span><strong style="color:var(--ink); font-weight:500;">0</strong> external requests</span>
            <span>prerendered in <strong style="color:var(--ink); font-weight:500;">{TOKENS.renderMs} ms</strong></span>
            <span>pimas <strong style="color:var(--ink); font-weight:500;">v{TOKENS.pimasVer}</strong></span>
          </div>
        </div>
      </div>

      <div style="position:relative; border-top:1px solid var(--line);">
        <div style="max-width:1080px; margin:0 auto; padding:16px 40px; display:flex; flex-direction:column; gap:4px; font-family:var(--mono); font-size:11px; letter-spacing:.14em; text-transform:uppercase; color:var(--granite);">
          <span>&copy; 2026 Noah Hyden</span>
        </div>
      </div>
    </footer>
  );
}
