/**
 * /pimas/ - a standalone writeup of the agent-native layer of pimas: an AI agent
 * that can run the exact what-if in a shadow graph and commit nothing. Same design
 * language as the rest of the site (Madeira basalt palette, Spectral / IBM Plex),
 * static HTML, zero JS. The live/shadow comparison is a static diagram - the
 * dashed outline is the site's stand-in for "speculative / uncommitted".
 */
import type { PageMeta } from "../design.js";
import { Shell } from "../components/Shell.js";
import { Island } from "../components/Island.js";
import AgentSim from "../islands/agent-sim.js";

export const meta: PageMeta = {
  path: "/pimas/",
  title: "pimas - simulate before you commit",
  description:
    "A personal project: a from-scratch reactive UI engine that lets an AI agent run the exact what-if in a shadow graph - predict a change without ever committing it.",
};

/** A small labelled state tile. `tone` picks the border/fill semantics. */
function Tile(props: { cap: string; val: string; tone: "plain" | "wrong" | "ok" | "shadow" }) {
  const map = {
    plain: "border:1.5px solid var(--line); color:var(--ink);",
    wrong: "border:1.5px solid var(--falu); background:rgba(128,24,24,.08); color:var(--falu);",
    ok: "border:1.5px solid var(--laurel); background:rgba(59,91,71,.09); color:var(--laurel);",
    shadow: "border:1.5px dashed var(--ocean); background:rgba(59,86,105,.08); color:var(--ocean);",
  } as const;
  const capColor = props.tone === "shadow" ? "var(--ocean)" : "var(--granite)";
  return (
    <div style={`width:132px; border-radius:3px; padding:11px 12px; ${map[props.tone]}`}>
      <span style={`display:block; font-family:var(--mono); font-size:10px; letter-spacing:.14em; text-transform:uppercase; color:${capColor}; margin-bottom:5px;`}>
        {props.cap}
      </span>
      <span style="font-family:var(--mono); font-size:15px; font-weight:600; font-variant-numeric:tabular-nums;">{props.val}</span>
    </div>
  );
}

function Lane(props: {
  head: string;
  emphasis: string;
  children?: import("pimas/dom").Child;
  meterLabel: string;
  meterValue: string;
  meterTone: "bad" | "good";
}) {
  const meterColor = props.meterTone === "bad" ? "var(--falu)" : "var(--laurel)";
  return (
    <div style="flex:1 1 260px; border:1px solid var(--line); border-radius:3px; background:var(--ground); padding:18px 18px 16px; display:flex; flex-direction:column; gap:16px;">
      <div style="font-family:var(--mono); font-size:12px; color:var(--granite);">
        {props.head} · <b style="color:var(--ink); font-weight:600;">{props.emphasis}</b>
      </div>
      <div style="min-height:96px; display:flex; align-items:center; justify-content:center; gap:14px; flex-wrap:wrap; background:radial-gradient(circle at 1px 1px, rgba(23,30,26,.07) 1px, transparent 0) 0 0 / 13px 13px; border-radius:2px; padding:16px;">
        {props.children}
      </div>
      <div style="display:flex; align-items:baseline; justify-content:space-between; border-top:1px dashed var(--line); padding-top:12px; font-family:var(--mono); font-size:12px; color:var(--granite);">
        <span>{props.meterLabel}</span>
        <span style={`font-size:26px; font-weight:700; letter-spacing:-.01em; font-variant-numeric:tabular-nums; color:${meterColor};`}>{props.meterValue}</span>
      </div>
    </div>
  );
}

function Reason(props: { ix: string; title: string; body: string }) {
  return (
    <div>
      <h3 style="font-family:var(--serif); font-weight:600; font-size:19px; letter-spacing:-.01em; margin:0 0 6px; display:flex; gap:11px; align-items:baseline;">
        <span style="font-family:var(--mono); font-size:13px; font-weight:600; color:var(--ocean);">{props.ix}</span>
        {props.title}
      </h3>
      <p style="font-family:var(--sans); font-size:15px; line-height:1.6; color:var(--granite); margin:0;">{props.body}</p>
    </div>
  );
}

function DiffCell(props: { what: string; gap: string }) {
  return (
    <div style="background:var(--ground); padding:16px 18px;">
      <div style="font-family:var(--sans); font-size:14.5px; font-weight:600; color:var(--ink); margin-bottom:4px;">{props.what}</div>
      <div style="font-family:var(--sans); font-size:13.5px; line-height:1.5; color:var(--granite);">{props.gap}</div>
    </div>
  );
}

function Stat(props: { big: string; bigColor: string; label: string }) {
  return (
    <div style="border-left:2px solid var(--ocean); padding:2px 0 2px 16px;">
      <div style={`font-family:var(--mono); font-size:34px; font-weight:700; letter-spacing:-.02em; line-height:1; font-variant-numeric:tabular-nums; color:${props.bigColor};`}>
        {props.big}
      </div>
      <div style="font-family:var(--sans); font-size:14.5px; line-height:1.5; color:var(--granite); margin-top:11px;">{props.label}</div>
    </div>
  );
}

function FitItem(props: { title: string; body: string }) {
  return (
    <li style="display:flex; gap:12px; align-items:baseline; font-family:var(--sans); font-size:15.5px; line-height:1.6; color:var(--granite);">
      <span style="flex:none; font-family:var(--mono); color:var(--ocean);">&rarr;</span>
      <span><b style="color:var(--ink); font-weight:600;">{props.title}</b> - {props.body}</span>
    </li>
  );
}

export default function Pimas() {
  return (
    <Shell>
      <header style="max-width:900px; margin:0 auto; padding:76px 40px 0;">
        <div style="font-family:var(--mono); font-size:12px; letter-spacing:.18em; text-transform:uppercase; color:var(--granite); margin:0 0 22px;">
          A personal project - pimas
        </div>
        <h1 style="font-family:var(--serif); font-weight:500; font-size:52px; line-height:1.05; letter-spacing:-.022em; margin:0; max-width:17ch;">
          Let an agent see what happens before it happens.
        </h1>
        <p style="font-family:var(--sans); font-size:17px; line-height:1.62; color:var(--granite); margin:24px 0 0; max-width:60ch;">
          Every way an AI agent touches software today, it has to <em>do</em> a thing to find out what the
          thing does - then look again. I&rsquo;ve been building a reactive engine where the agent runs the
          exact what-if in a shadow, commits nothing, and leaves the real system untouched.
        </p>
      </header>

      <main style="max-width:900px; margin:0 auto; padding:0 40px;">

        {/* live vs shadow */}
        <div style="margin:44px 0 8px; display:flex; gap:14px; flex-wrap:wrap;">
          <Lane head="Ordinary agent" emphasis="act &amp; re-scrape" meterLabel="wrong live states" meterValue="27&ndash;36" meterTone="bad">
            <Tile cap="live model" val="rank #4" tone="wrong" />
          </Lane>
          <Lane head="pimas agent" emphasis="simulate first" meterLabel="wrong live states" meterValue="0" meterTone="good">
            <Tile cap="live model" val="rank #3" tone="ok" />
            <Tile cap="shadow" val="rank #4" tone="shadow" />
          </Lane>
        </div>
        <p style="font-family:var(--mono); font-size:12px; color:var(--granite); text-align:center; margin:6px 0 0;">
          same task - &ldquo;find the one input that lifts this to&nbsp;#1&rdquo; - both agents reach the same answer
        </p>

        {/* stat strip */}
        <div style="display:grid; grid-template-columns:repeat(3,1fr); gap:18px; margin:44px 0;">
          <Stat big="0" bigColor="var(--laurel)" label="wrong live states the pimas agent passes through - vs 27–36 for the ordinary one" />
          <Stat big="~14×" bigColor="var(--ink)" label="fewer actions to reach the same answer (4 vs 55 on the solvable task)" />
          <Stat big="exact" bigColor="var(--ink)" label="re-runs the app's own logic - ground truth, not a learned world-model guess" />
        </div>

        {/* live demo island */}
        <section style="margin:48px 0;">
          <div style="font-family:var(--mono); font-size:11px; letter-spacing:.18em; text-transform:uppercase; color:var(--granite); margin:0 0 14px;">See it - not a video, the real engine</div>
          <Island slug="agent-sim" component={AgentSim} client="visible" />
        </section>

        {/* why */}
        <section style="margin:52px 0;">
          <div style="font-family:var(--mono); font-size:11px; letter-spacing:.18em; text-transform:uppercase; color:var(--granite); margin:0 0 8px;">Why non-committal is the whole point</div>
          <h2 style="font-family:var(--serif); font-weight:500; font-size:32px; line-height:1.1; letter-spacing:-.02em; margin:0 0 28px; max-width:20ch;">Observation shouldn&rsquo;t require mutation.</h2>
          <div style="display:grid; grid-template-columns:repeat(2,1fr); gap:26px 40px;">
            <Reason ix="01" title="Side effects don't fire" body="A probe isn't free - it can send a request, write a row, trigger a cascade. Speculate recomputes the derived result with no effect flushed. The network, the database, the DOM are never touched." />
            <Reason ix="02" title="The live app never goes wrong" body="The search runs in a shadow, so nobody watching sees the app thrash, the store never holds garbage between tries, and a crash mid-search can't freeze it in a broken state." />
            <Reason ix="03" title="Planning is counterfactuals" body="To choose between three moves you must evaluate branches you won't take. If evaluating means committing, you can't compare without entering all three. Speculate weighs them against the same start; the agent commits once." />
            <Reason ix="04" title="Exact, not approximate" body="Learned agent world-models guess the outcome and drift. pimas re-runs the app's own pure logic against a shadow of the real dependency graph - bit-identical to what committing would have produced." />
          </div>
        </section>

        {/* how */}
        <section style="margin:52px 0;">
          <div style="font-family:var(--mono); font-size:11px; letter-spacing:.18em; text-transform:uppercase; color:var(--granite); margin:0 0 8px;">Why an ordinary stack can&rsquo;t</div>
          <h2 style="font-family:var(--serif); font-weight:500; font-size:32px; line-height:1.1; letter-spacing:-.02em; margin:0 0 24px; max-width:22ch;">It&rsquo;s cheap only on a graph that already exists.</h2>
          <div style="border:1px solid var(--line); border-radius:3px; background:var(--surface); padding:26px 28px; font-family:var(--sans); font-size:16px; line-height:1.65; color:var(--granite);">
            <p style="margin:0 0 14px;">
              pimas is a fine-grained reactive engine: state is observable, and it keeps the
              <b style="color:var(--ink);"> dependency graph</b> (what derives from what) separate from the
              <b style="color:var(--ink);"> values</b> flowing through it. So a hypothetical is just: shadow the
              values, reuse the real graph read-only, don&rsquo;t flush the effects, and roll back by throwing the
              shadow away. The same surface projects onto the browser&rsquo;s WebMCP tool standard as
              <span style="font-family:var(--mono); font-size:14px; color:var(--ocean);"> simulate_*</span> tools an
              agent just calls.
            </p>
            <p style="margin:0;">
              A virtual-DOM framework has no standing dependency graph to shadow - it would have to re-render
              and diff, with no guarantee the result is side-effect-free.
              <b style="color:var(--ink);"> Committing is how you normally find out what happens; here the agent
              finds out without it happening</b> - so the UI stops being a surface you poke and becomes a
              model you query.
            </p>
          </div>
        </section>

        {/* how this differs - pre-empt the "isn't this just X?" */}
        <section style="margin:52px 0;">
          <div style="font-family:var(--mono); font-size:11px; letter-spacing:.18em; text-transform:uppercase; color:var(--granite); margin:0 0 8px;">&ldquo;Isn&rsquo;t this just&hellip;?&rdquo;</div>
          <h2 style="font-family:var(--serif); font-weight:500; font-size:32px; line-height:1.1; letter-spacing:-.02em; margin:0 0 12px; max-width:22ch;">Non-committal what-if isn&rsquo;t new. This combination is.</h2>
          <p style="font-family:var(--sans); font-size:16px; line-height:1.6; color:var(--granite); margin:0 0 24px; max-width:64ch;">
            Speculative execution is a well-worn idea - a database can do it, a spreadsheet can do it. What
            no one has put together is <b style="color:var(--ink);">exact + zero side-effects + on a live reactive UI graph + as a first-class agent tool</b>. Each neighbour gives up one of those:
          </p>
          <div style="display:grid; grid-template-columns:1fr 1fr; gap:1px; background:var(--line); border:1px solid var(--line); border-radius:3px; overflow:hidden;">
            <DiffCell what="Optimistic UI / snapshots" gap="commit, then roll back - the side effects already fired." />
            <DiffCell what="Agent sandboxes / computer-use" gap="really execute, just in an isolated copy - effects fire there, and it&rsquo;s a whole environment." />
            <DiffCell what="LangGraph time-travel / fork" gap="re-executes nodes - &lsquo;LLM calls, API requests fire again&rsquo; (their docs)." />
            <DiffCell what="Tool approval (human-in-the-loop)" gap="shows the proposed call, not the exact resulting state." />
            <DiffCell what="Learned agent world-models" gap="approximate - they guess the outcome and drift." />
            <DiffCell what="Datomic with · spreadsheets · PRAXA" gap="real non-committal what-if - but on a DB value, a cell grid, or an analyst&rsquo;s view; not a live UI an agent queries." />
          </div>
          <p style="font-family:var(--mono); font-size:13px; line-height:1.6; color:var(--ink); margin:20px 0 0;">
            pimas is the one that is <span style="color:var(--laurel);">all four at once</span>.
          </p>
        </section>

        {/* fit */}
        <section style="margin:52px 0;">
          <div style="font-family:var(--mono); font-size:11px; letter-spacing:.18em; text-transform:uppercase; color:var(--granite); margin:0 0 8px;">Sharpest fit</div>
          <h2 style="font-family:var(--serif); font-weight:500; font-size:32px; line-height:1.1; letter-spacing:-.02em; margin:0 0 24px; max-width:24ch;">Agents that plan over state where a wrong commit costs something.</h2>
          <ul style="list-style:none; padding:0; margin:0; display:grid; gap:14px;">
            <FitItem title="Agentic workflows & ops" body="preview the exact resulting state, then approve → commit, instead of mutating live systems to see what an action does." />
            <FitItem title="Robotics & physical orchestration" body="&lsquo;simulate before you act&rsquo; as a safety property when the committed action moves something real and irreversible." />
            <FitItem title="Quantitative models" body="pricing, project economics, risk - the model is already pure, so exact what-if is free and what-if is the whole job." />
            <FitItem title="Tooling for AI agents" body="give any agent a non-committal preview of a tool's effect before it fires, as a first-class capability." />
          </ul>
        </section>

        {/* cta */}
        <section style="margin:52px 0 72px; background:var(--ink); border-radius:4px; padding:30px 32px; display:flex; flex-wrap:wrap; align-items:center; justify-content:space-between; gap:18px;">
          <div style="font-family:var(--sans); font-size:16.5px; line-height:1.5; color:var(--ground); max-width:46ch;">
            It&rsquo;s real code and a reproducible benchmark, not a deck.
            <span style="color:var(--tile);"> Building agents that touch live state? Let&rsquo;s go deep.</span>
          </div>
          <a href="https://github.com/noahhyden/pimas" target="_blank" rel="noopener" style="font-family:var(--mono); font-size:13px; letter-spacing:.03em; background:var(--laurel); color:var(--ground); padding:13px 22px; border-radius:2px; white-space:nowrap;">
            Read the code &rarr;
          </a>
        </section>

      </main>
    </Shell>
  );
}
