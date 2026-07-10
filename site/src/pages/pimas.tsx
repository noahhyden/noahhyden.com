/**
 * /pimas/ - a writeup of pimas: a from-scratch fine-grained reactive UI engine
 * whose standing dependency graph an AI agent can subscribe to, get causal
 * explanations from, and simulate against before it acts. Facts here are taken
 * from the pimas repo README (the source of truth); this page explains, plainly,
 * what it is, how it works, why it works, and where it fits. Same design language
 * as the rest of the site, static HTML, zero JS except the one live-demo island.
 */
import type { Child } from "pimas-ui/dom";
import type { PageMeta } from "../design.js";
import { Shell } from "../components/Shell.js";
import { Island } from "../components/Island.js";
import AgentSim from "../islands/agent-sim.js";

export const meta: PageMeta = {
  path: "/pimas/",
  title: "pimas - a reactive UI engine an agent can simulate against",
  description:
    "A from-scratch fine-grained reactive UI framework (zero runtime dependencies, no virtual DOM) whose dependency graph an AI agent can subscribe to, get causal explanations from, and simulate against before it commits anything.",
};

const eyebrow =
  "font-family:var(--mono); font-size:11px; letter-spacing:.18em; text-transform:uppercase; color:var(--granite); margin:0 0 8px;";
const h2s =
  "font-family:var(--serif); font-weight:500; font-size:31px; line-height:1.12; letter-spacing:-.02em; margin:0 0 18px; max-width:26ch;";
const h3s =
  "font-family:var(--serif); font-weight:600; font-size:20px; letter-spacing:-.01em; margin:34px 0 10px; color:var(--ink);";
const body =
  "font-family:var(--sans); font-size:16px; line-height:1.7; color:var(--ink); margin:0 0 18px; max-width:72ch;";

/** Inline code / identifier. */
function C(props: { children: Child }) {
  return (
    <span style="font-family:var(--mono); font-size:.86em; color:var(--ocean); white-space:nowrap;">
      {props.children}
    </span>
  );
}

/** A numbered mechanism step. */
function Step(props: { n: string; children: Child }) {
  return (
    <li style="display:flex; gap:15px; align-items:baseline; margin:0 0 12px;">
      <span style="flex:none; font-family:var(--mono); font-size:12px; font-weight:600; color:var(--ocean); width:20px;">
        {props.n}
      </span>
      <span style="font-family:var(--sans); font-size:15.5px; line-height:1.64; color:var(--ink);">
        {props.children}
      </span>
    </li>
  );
}

function Reason(props: { ix: string; title: string; body: Child }) {
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

function DiffCell(props: { what: string; gap: Child }) {
  return (
    <div style="background:var(--ground); padding:16px 18px;">
      <div style="font-family:var(--sans); font-size:14.5px; font-weight:600; color:var(--ink); margin-bottom:4px;">{props.what}</div>
      <div style="font-family:var(--sans); font-size:13.5px; line-height:1.5; color:var(--granite);">{props.gap}</div>
    </div>
  );
}

function FitItem(props: { title: string; body: Child }) {
  return (
    <li style="display:flex; gap:12px; align-items:baseline; font-family:var(--sans); font-size:15.5px; line-height:1.62; color:var(--granite);">
      <span style="flex:none; font-family:var(--mono); color:var(--ocean);">&rarr;</span>
      <span><b style="color:var(--ink); font-weight:600;">{props.title}</b> - {props.body}</span>
    </li>
  );
}

export default function Pimas() {
  return (
    <Shell>
      <header style="max-width:900px; margin:0 auto; padding:76px 40px 0;">
        <div style={eyebrow.replace("11px", "12px")}>A personal project - pimas</div>
        <h1 style="font-family:var(--serif); font-weight:500; font-size:50px; line-height:1.06; letter-spacing:-.022em; margin:0; max-width:19ch;">
          A reactive UI engine an agent can simulate against before it acts.
        </h1>
        <p style="font-family:var(--sans); font-size:17px; line-height:1.64; color:var(--ink); margin:24px 0 0; max-width:66ch;">
          pimas is a fine-grained reactive UI framework I built from scratch: no React, no virtual DOM, no
          in-browser transpiler, zero runtime dependencies. It is the same engine class as SolidJS. Values are
          observable, and only the exact DOM nodes that read a changed value update; there is no diffing. This
          site is built on it and its static pages ship no framework JavaScript at all (just one
          sub-1&nbsp;KB inline theme toggle).
        </p>
        <p style="font-family:var(--sans); font-size:17px; line-height:1.64; color:var(--granite); margin:18px 0 0; max-width:66ch;">
          The framework is also the lab for the part worth owning. A from-scratch fine-grained engine keeps a
          standing <b style="color:var(--ink);">dependency graph</b> of what derives from what. That graph is,
          incidentally, a live machine-readable model of the page - something an agent can subscribe to, get
          causal explanations from, and <b style="color:var(--ink);">simulate against before it acts</b>. A
          virtual DOM has no such graph, and the reason it cannot is mechanical. That is the rest of this page.
        </p>
      </header>

      <main style="max-width:900px; margin:0 auto; padding:0 40px;">

        {/* live demo island */}
        <section style="margin:44px 0 8px;">
          <div style={eyebrow}>A live demo, running in your browser</div>
          <Island slug="agent-sim" component={AgentSim} client="visible" />
        </section>

        {/* the problem */}
        <section style="margin:52px 0;">
          <div style={eyebrow}>The problem it solves</div>
          <h2 style={h2s}>Observation shouldn&rsquo;t require mutation.</h2>
          <p style={body}>
            Every existing way an agent touches a UI - WebMCP actions, computer-use, Playwright scraping - shares
            one property: to learn what an action does, it has to <em>do</em> the action, then look again.
            Observation requires mutation. So real side effects fire (a network write, an email, a database row),
            the live app passes through every wrong state the agent considered, and planning more than one step
            ahead means entering branches you will not keep.
          </p>
          <p style={body}>
            <C>speculate</C> removes that tax: it computes the exact derived consequence of a change with nothing
            committed, so the UI stops being a surface you poke and becomes a model you query.
          </p>
        </section>

        {/* how it works */}
        <section style="margin:52px 0;">
          <div style={eyebrow}>How it works</div>
          <h2 style={h2s}>One mechanism, three surfaces.</h2>

          <h3 style={h3s}>The reactive kernel</h3>
          <p style={body}>
            The whole engine is one idea: reading a value inside a computation subscribes that computation to it,
            and writing the value re-runs exactly the computations that read it. The core is about 200 lines.
            Every reactive thing - a <b style="color:var(--ink);">signal</b> (a unit of state), a{" "}
            <b style="color:var(--ink);">memo</b> (a value derived by a pure function), an{" "}
            <b style="color:var(--ink);">effect</b> (a computation that acts on the outside world) - is the same
            kind of node. Each node records the nodes it read last run (its sources) and the nodes that read it
            (its observers); reads and writes keep both links in sync.
          </p>
          <p style={body}>
            Updates are two-phase, which is what keeps them glitch-free. A write only marks its dependents -
            directly downstream nodes as definitely-stale, everything below as maybe-stale - and computes
            nothing. Computation happens lazily on read: a maybe-stale node checks its own sources first, recomputes
            only if one of them actually changed, and propagates further only if its own result actually changed. A
            value written back equal to what it was stops the cascade dead. A diamond (two paths from one source to
            one sink) recomputes the sink exactly once, on fully-current inputs. Subscriptions are rebuilt every
            run, so a conditional branch subscribes only to what it actually read that time.
          </p>

          <h3 style={h3s}>Rendering, without a diff</h3>
          <p style={body}>
            The renderer never diffs. It runs each component once to build real DOM nodes and wraps every dynamic
            binding in its own effect, so a change re-runs one binding, not a subtree. The common case - a text
            node whose value became a new string - reassigns that one text node&rsquo;s contents in place. The
            same component code renders two ways through a single seam: in the browser a dynamic binding is a live
            subscription; on the server it runs once with no subscription and bakes into HTML. Nothing in a
            component knows which backend it ran under. That is why this site prerenders to static HTML at 0&nbsp;KB
            JS, and why an interactive <b style="color:var(--ink);">island</b> can <C>claim()</C> the
            server-rendered DOM in place instead of throwing it away and rebuilding it.
          </p>

          <h3 style={h3s}>The agent surface: subscribe, explain, simulate</h3>
          <p style={body}>
            <C>pimas/agent</C> turns the running graph into three things an agent can use. You declare what is
            readable with <C>expose(name,&nbsp;fn)</C> and what is callable with <C>action(name,&nbsp;fn)</C>.
          </p>
          <ul style="list-style:none; padding:0; margin:0 0 6px;">
            <Step n="L1">
              <b style="color:var(--ink);">Subscribe.</b> Each exposed value is wrapped in an effect that emits a
              delta whenever it changes. Because the accessor runs inside that effect, it subscribes to exactly the
              fields it reads - <C>{"() => rows[3].status"}</C> watches just that field. The agent is pushed
              changes; no polling, no scraping the DOM.
            </Step>
            <Step n="L2">
              <b style="color:var(--ink);">Explain.</b> Calling an action records what it wrote and which exposed
              values changed as a result, by walking the dependency graph. <C>explain()</C> returns a causal
              sentence: <em>total</em> changed because <em>addItem</em> wrote <C>cart[3].qty</C>, which the{" "}
              <em>total</em> memo reads.
            </Step>
            <Step n="L3">
              <b style="color:var(--ink);">Simulate.</b> <C>speculate</C> runs hypothetical writes against a shadow
              of the graph and returns the exact predicted state without committing. It is the piece the rest of
              the framework exists to make possible - the next section.
            </Step>
          </ul>
        </section>

        {/* how a what-if runs */}
        <section style="margin:52px 0;">
          <div style={eyebrow}>The mechanism</div>
          <h2 style={h2s}>How a what-if actually runs.</h2>
          <p style={body}>
            <C>speculate</C> works because the graph separates two things a virtual DOM keeps tangled: the{" "}
            <b style="color:var(--ink);">topology</b> (what derives from what) and the{" "}
            <b style="color:var(--ink);">values</b> flowing through it. A what-if shadows the values and reuses the
            topology read-only.
          </p>
          <ol style="list-style:none; padding:0; margin:0 0 8px;">
            <Step n="1">A shadow overlay is opened - a map from node to hypothetical value. The real nodes are not touched.</Step>
            <Step n="2">The hypothetical write lands only in the overlay.</Step>
            <Step n="3">
              Reads during the speculation return the shadowed value if there is one; otherwise a memo is
              recomputed <em>detached</em> (no subscription, no ownership) against the overlay and cached, so a
              diamond still computes once; otherwise the real committed value is returned.
            </Step>
            <Step n="4">No effect ever fires. Nothing that talks to the network, the DOM, or storage runs.</Step>
            <Step n="5">The predicted state you asked for is read off the overlay and returned.</Step>
            <Step n="6">Rollback is free: the overlay is dropped. The real graph was never mutated, so there is nothing to undo.</Step>
          </ol>
          <p style={body}>
            <C>speculatePlan</C> composes several changes in one shadow; <C>speculateSweep</C> runs one independent
            what-if per input, for a sensitivity sweep; <C>commitPlan</C> applies an approved scenario for real, so
            preview and commit stay symmetric. Store edits are shadowed too, by copy-on-write, so hypothetical
            changes to tables and lists work the same way.
          </p>

          <div style="display:grid; grid-template-columns:repeat(2,1fr); gap:26px 40px; margin-top:32px;">
            <Reason ix="01" title="Side effects don't fire" body="A probe isn't free in a normal system: it can send a request, write a row, trigger a cascade. speculate recomputes the derived result with no effect flushed. The network, the database, the DOM are never touched." />
            <Reason ix="02" title="The live app never goes wrong" body="The search runs in the shadow, so nobody watching the app sees it thrash, the state never holds garbage between tries, and a crash mid-search can't freeze the real app in a broken state." />
            <Reason ix="03" title="Planning is counterfactuals" body="To choose between moves you must evaluate branches you won't take. If evaluating means committing, you can't compare without entering all of them. speculate weighs them against the same starting point; the agent commits once." />
            <Reason ix="04" title="Exact, not approximate" body="A learned world-model guesses the outcome and drifts. speculate re-runs the app's own pure memos against a shadow of the real graph, so the prediction is bit-identical to what committing would have produced." />
          </div>
        </section>

        {/* why an ordinary stack can't */}
        <section style="margin:52px 0;">
          <div style={eyebrow}>Why an ordinary stack can&rsquo;t</div>
          <h2 style={h2s}>It needs a graph that exists before the question is asked.</h2>
          <div style="border:1px solid var(--line); border-radius:3px; background:var(--surface); padding:24px 26px;">
            <p style="font-family:var(--sans); font-size:16px; line-height:1.68; color:var(--granite); margin:0;">
              A virtual-DOM framework keeps no standing dependency graph. To find out what a change does it
              re-renders the component tree and diffs the output - and rendering routinely runs effects and reads
              that are not guaranteed pure, so there is no way to promise a probe was side-effect-free, and no exact
              derived state to read short of actually applying the change. A fine-grained engine keeps the graph
              standing between updates; a re-render-and-diff framework builds a fresh one every time and throws it
              away. <b style="color:var(--ink);">Speculation needs the graph that is already there.</b>
            </p>
          </div>
        </section>

        {/* benchmark */}
        <section style="margin:52px 0;">
          <div style={eyebrow}>Measured, with a real agent in the loop</div>
          <h2 style={h2s}>Same policy, same answers, a fraction of the footprint.</h2>
          <p style={body}>
            The same grid-search policy drives an OECD-style composite-indicator model through the projected tools
            under two conditions: a <b style="color:var(--ink);">baseline</b> that can only mutate and re-read, and
            one that also has the <C>simulate_*</C> tools. Both reach the same correct answer. The only thing that
            differs is what the run costs and how many wrong states the live model passes through.
          </p>
          <div style="overflow-x:auto; margin:24px 0 0;">
            <table style="width:100%; border-collapse:collapse; font-family:var(--sans); font-size:14.5px;">
              <thead>
                <tr>
                  <th style="text-align:left; font-family:var(--mono); font-size:11px; letter-spacing:.1em; text-transform:uppercase; color:var(--granite); font-weight:600; padding:0 14px 10px 0; border-bottom:1px solid var(--line);">Task</th>
                  <th style="text-align:left; font-family:var(--mono); font-size:11px; letter-spacing:.1em; text-transform:uppercase; color:var(--granite); font-weight:600; padding:0 14px 10px; border-bottom:1px solid var(--line);">Baseline (mutate &amp; re-read)</th>
                  <th style="text-align:left; font-family:var(--mono); font-size:11px; letter-spacing:.1em; text-transform:uppercase; color:var(--laurel); font-weight:600; padding:0 0 10px 14px; border-bottom:1px solid var(--line);">With simulate_*</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style="padding:14px 14px 14px 0; border-bottom:1px solid var(--line); color:var(--ink);">France &rarr; top-2 <span style="color:var(--granite);">(solvable)</span></td>
                  <td style="padding:14px; border-bottom:1px solid var(--line); color:var(--granite); font-variant-numeric:tabular-nums;">55 calls &middot; 37 commits &middot; <b style="color:var(--falu);">27 wrong live states</b></td>
                  <td style="padding:14px 0 14px 14px; border-bottom:1px solid var(--line); color:var(--granite); font-variant-numeric:tabular-nums;">4 calls &middot; 1 commit &middot; <b style="color:var(--laurel);">0</b></td>
                </tr>
                <tr>
                  <td style="padding:14px 14px 14px 0; color:var(--ink);">Germany &rarr; #1 <span style="color:var(--granite);">(impossible)</span></td>
                  <td style="padding:14px; color:var(--granite); font-variant-numeric:tabular-nums;">54 calls &middot; 36 commits &middot; <b style="color:var(--falu);">36 wrong live states</b></td>
                  <td style="padding:14px 0 14px 14px; color:var(--granite); font-variant-numeric:tabular-nums;">3 calls &middot; 0 commits &middot; <b style="color:var(--laurel);">0</b></td>
                </tr>
              </tbody>
            </table>
          </div>
          <p style="font-family:var(--sans); font-size:15px; line-height:1.64; color:var(--granite); margin:22px 0 0; max-width:72ch;">
            &ldquo;Impossible&rdquo; is where non-committal wins hardest: to be sure a goal cannot be reached, the
            baseline has to probe the whole space and pass through every wrong state on the way; the agent-native
            run sweeps it in the shadow and never touches the real model. The same preview &rarr; approve &rarr;
            commit loop has also run end-to-end against a real HTTP backend, where the preview shows the exact
            resulting totals and only the approved action fires a real write.
          </p>
        </section>

        {/* isn't this just */}
        <section style="margin:52px 0;">
          <div style={eyebrow}>&ldquo;Isn&rsquo;t this just&hellip;?&rdquo;</div>
          <h2 style={h2s}>Non-committal what-if isn&rsquo;t new. This combination is.</h2>
          <p style="font-family:var(--sans); font-size:16px; line-height:1.62; color:var(--granite); margin:0 0 24px; max-width:66ch;">
            Speculative execution is a well-worn idea. What no one has put in one place is{" "}
            <b style="color:var(--ink);">exact, zero side-effects, on a live reactive UI graph, as a first-class
            agent tool</b>. Each neighbour gives up one of those.
          </p>
          <div style="display:grid; grid-template-columns:1fr 1fr; gap:1px; background:var(--line); border:1px solid var(--line); border-radius:3px; overflow:hidden;">
            <DiffCell what="React / any virtual DOM" gap="No standing dependency graph to shadow: to see a change it re-renders and diffs, and rendering isn't guaranteed side-effect-free." />
            <DiffCell what="SolidJS (same engine class)" gap="The reactivity is the same idea. The agent surface - subscribe, explain, speculate - has no Solid analog." />
            <DiffCell what="WebMCP / computer-use / Playwright" gap="Every agent-to-UI path here is call-an-action or scrape-a-snapshot; to learn what an action does you run it. None expose the live graph." />
            <DiffCell what="Optimistic UI / MST snapshots" gap="Commit then roll back (or deep-copy) for UX latency, driven by the app. speculate pre-computes without committing, for the agent, with a values-only shadow and free rollback." />
            <DiffCell what="LangGraph time-travel / fork" gap="Re-executes nodes - 'LLM calls, API requests fire again' (their docs)." />
            <DiffCell what="Learned agent world-models" gap="Guess the next state and drift. speculate re-runs the app's own pure memos, so the prediction is bit-identical to committing." />
            <DiffCell what="Redux DevTools / MobX trace" gap="Causal tracing exists - for humans. Exposing the causal chain to an agent is unclaimed." />
            <DiffCell what="Datomic · spreadsheets · PRAXA" gap="Real non-committal what-if, but on a DB value, a cell grid, or an analyst's view; not a live UI graph an agent queries." />
          </div>
        </section>

        {/* fit */}
        <section style="margin:52px 0;">
          <div style={eyebrow}>Where it fits</div>
          <h2 style={h2s}>Sharpest where a wrong commit costs something, and the logic is pure.</h2>
          <ul style="list-style:none; padding:0; margin:0 0 26px; display:grid; gap:14px;">
            <FitItem title="Quantitative models (the sharpest fit)" body={
              <>
                pricing, project economics, risk, physical models. The math is already pure, so exact what-if is
                free and what-if is the whole job. Proven on a self-replicating lunar-factory model (
                <a href="https://github.com/noahhyden/von-neumann" target="_blank" rel="noopener" style="color:var(--ocean); border-bottom:1px solid var(--ocean); white-space:nowrap;">von-neumann</a>
                , written up in the <a href="/papers/" style="color:var(--ocean); border-bottom:1px solid var(--ocean);">papers</a>) and an OECD-style composite indicator (sector-engines).
              </>
            } />
            <FitItem title="Agentic ops & workflows" body="preview the exact resulting state, approve, then commit - instead of mutating live systems to find out what an action does. Run end-to-end against a real HTTP backend." />
            <FitItem title="Robotics & physical orchestration" body="'simulate before you act' as a safety property, when the committed action moves something real and irreversible." />
            <FitItem title="Tooling for AI agents" body="give any agent a non-committal preview of a tool's effect before it fires, projected onto WebMCP as simulate_* tools it calls like any other." />
          </ul>
          <div style="border-left:2px solid var(--falu); padding:4px 0 4px 16px;">
            <p style="font-family:var(--sans); font-size:15px; line-height:1.64; color:var(--granite); margin:0; max-width:70ch;">
              <b style="color:var(--ink);">One honest limitation.</b> <C>speculate</C> is exact only if the
              derivations are pure - assumed, not enforced. That is exactly why the sharpest fit is pure,
              derived-heavy models: there, purity is free rather than a property you have to police.
            </p>
          </div>
        </section>

        {/* code */}
        <section style="margin:52px 0 72px; border-top:1px solid var(--line); padding-top:28px; display:flex; flex-wrap:wrap; align-items:baseline; justify-content:space-between; gap:14px;">
          <p style="font-family:var(--sans); font-size:16px; line-height:1.6; color:var(--granite); margin:0; max-width:52ch;">
            The code, the decisions log, and the benchmark harness are on GitHub. It is published to npm as{" "}
            <C>pimas-ui</C>.
          </p>
          <a href="https://github.com/noahhyden/pimas" target="_blank" rel="noopener" style="font-family:var(--mono); font-size:13px; letter-spacing:.03em; color:var(--falu); border-bottom:1px solid var(--falu); padding-bottom:2px; white-space:nowrap;">
            github.com/noahhyden/pimas &rarr;
          </a>
        </section>

      </main>
    </Shell>
  );
}
