import type { Child } from "pimas-ui/dom";
import type { PageMeta } from "../design.js";
import { Shell } from "../components/Shell.js";
import { Card } from "../components/primitives.js";
import { Island } from "../components/Island.js";
import AgentSim from "../islands/agent-sim.js";

export const meta: PageMeta = {
  path: "/pimas/",
  title: "pimas - exact what-if over a live reactive model",
  description:
    "A small reactive model runtime with zero runtime dependencies. An agent, or a React preview UI, can simulate a change against the model's dependency graph without committing it.",
};

const h2s =
  "font-family:var(--serif); font-weight:500; font-size:31px; line-height:1.12; letter-spacing:-.02em; margin:0 0 18px; max-width:26ch;";
const body =
  "font-family:var(--sans); font-size:16px; line-height:1.7; color:var(--ink); margin:0 0 18px; max-width:72ch;";
const ink = "color:var(--ink);";

/** Inline code / identifier. */
function C(props: { children: Child }) {
  return (
    <span style="font-family:var(--mono); font-size:.86em; color:var(--ocean); white-space:nowrap;">
      {props.children}
    </span>
  );
}

/** A numbered step. */
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

function FitItem(props: { title: string; body: Child }) {
  return (
    <li style="margin:0;">
      <Card tone="ground" outline={true} lift={false} pad="sm">
        <div style="display:flex; gap:12px; align-items:baseline; font-family:var(--sans); font-size:15.5px; line-height:1.62; color:var(--granite);">
          <span style="flex:none; font-family:var(--mono); color:var(--ocean);">&rarr;</span>
          <span><b style="color:var(--ink); font-weight:600;">{props.title}</b> - {props.body}</span>
        </div>
      </Card>
    </li>
  );
}

export default function Pimas() {
  return (
    <Shell>
      <header style="max-width:900px; margin:0 auto; padding:76px 40px 0;">
        <h1 style="font-family:var(--serif); font-weight:500; font-size:50px; line-height:1.06; letter-spacing:-.022em; margin:0; max-width:19ch;">
          Exact what-if over a live reactive model.
        </h1>
        <p style="font-family:var(--sans); font-size:17px; line-height:1.64; color:var(--ink); margin:24px 0 0; max-width:66ch;">
          pimas is a small reactive model runtime I built from scratch, published on npm as <C>pimas-ui</C>. You
          put derived state in signals, memos and a store. <C>speculate</C> answers &ldquo;what would{" "}
          <em>total</em> be if I set qty to 10?&rdquo; by recomputing those memos against a shadow of the graph:
          effects do not run, the live model does not change, and the number you get is the number a real commit
          would produce. An agent or a React preview UI can use it. Zero runtime dependencies; React is an
          optional peer.
        </p>
        <p style="font-family:var(--sans); font-size:17px; line-height:1.64; color:var(--granite); margin:18px 0 0; max-width:66ch;">
          pimas no longer includes a renderer or JSX: the current release (0.4) is the model runtime only. The
          renderer lives on in <C>pimas-ui@0.1.2</C>, which is what this site is built with.
        </p>
      </header>

      <main style="max-width:900px; margin:0 auto; padding:0 40px;">

        <section style="margin:44px 0 8px;">
          <p style="font-family:var(--sans); font-size:16px; line-height:1.7; color:var(--granite); margin:0 0 18px; max-width:72ch;">
            Drive the model or watch an agent, then look at the dependency graph below it: the nodes are this
            model&rsquo;s own signals and memos, and one lights only when its compute function actually re-ran.
          </p>
          <Island slug="agent-sim" component={AgentSim} client="visible" />
        </section>

        <section style="margin:52px 0;">
          <h2 style={h2s}>How it works.</h2>
          <p style={body}>
            Reading a value inside a computation subscribes that computation to it, and writing the value re-runs
            exactly the computations that read it. A <b style={ink}>signal</b> is a unit of state, a{" "}
            <b style={ink}>memo</b> is a value derived by a pure function, and an <b style={ink}>effect</b> acts on
            the outside world. Updates are glitch-free: a diamond (two paths from one source to one sink)
            recomputes the sink once, and a value written back equal to what it was stops the cascade.
          </p>
          <p style={body}>
            <C>speculate</C> works because the graph separates the topology (what derives from what) from the
            values flowing through it. A what-if writes into a shadow overlay and recomputes memos against it,
            detached and cached, so the real nodes are never touched and no effect fires. Rollback is free: the
            overlay is dropped. <C>speculatePlan</C> applies several changes in one shadow, so A-then-B is not two
            previews that reset, and <C>commitPlan</C> applies an approved plan for real. Store edits are shadowed
            too.
          </p>
        </section>

        <section style="margin:52px 0;">
          <h2 style={h2s}>The agent bridge.</h2>
          <p style={body}>
            <C>pimas-ui/agent</C> turns a model into a surface an agent can use. You declare what is readable with{" "}
            <C>expose(name,&nbsp;fn)</C> and what is callable with <C>action(name,&nbsp;fn)</C>. The bridge carries{" "}
            <C>snapshot</C>, <C>subscribe</C>, <C>call</C>, <C>explain</C>, <C>history</C>, <C>speculate</C>,{" "}
            <C>speculatePlan</C> and <C>commitPlan</C>.
          </p>
          <ul style="list-style:none; padding:0; margin:0 0 6px;">
            <Step n="1">
              <b style={ink}>Subscribe.</b> Exposed values push a delta when they change, so the agent does not
              poll or scrape the DOM.
            </Step>
            <Step n="2">
              <b style={ink}>Explain.</b> <C>explain()</C> returns a causal record of what an action wrote and which
              exposed values changed as a result.
            </Step>
            <Step n="3">
              <b style={ink}>Simulate.</b> <C>speculate</C> returns the predicted state without committing.
            </Step>
          </ul>
          <p style={body}>
            <C>toWebMCP</C>, also from <C>pimas-ui/agent</C>, projects the bridge onto WebMCP as the actions plus <C>get_*</C> and{" "}
            <C>simulate_*</C> tools, and <C>installPageAgent</C> puts the same surface on <C>window.__pimas</C> where
            WebMCP is not available. A preview UI and an agent call the same function, so they cannot disagree
            about the answer.
          </p>
        </section>

        <section style="margin:52px 0;">
          <h2 style={h2s}>Where it fits.</h2>
          <ul style="list-style:none; padding:0; margin:0 0 26px; display:grid; gap:14px;">
            <FitItem title="Quantitative models" body={
              <>
                pricing, project economics, risk, physical models. The math is already pure, so exact what-if is
                cheap. The demo above runs an OECD-style composite indicator, and the{" "}
                <a href="https://github.com/noahhyden/von-neumann" target="_blank" rel="noopener" style="color:var(--ocean); white-space:nowrap;">von-neumann</a>
                {" "}lunar-factory model is the other target.
              </>
            } />
            <FitItem title="Preview before commit" body="show the exact resulting state, then commit only what the user or agent approved." />
            <FitItem title="Tooling for AI agents" body="give an agent a non-committal preview of an action before it fires, as a simulate_* tool." />
          </ul>
          <Card tone="ground" outline={false} lift={false} pad="sm" style="border-left:2px solid var(--falu);">
            <p style="font-family:var(--sans); font-size:15px; line-height:1.64; color:var(--granite); margin:0; max-width:70ch;">
              <b style={ink}>Limit.</b> <C>speculate</C> is exact only if memos are pure. That is assumed, not
              enforced: keep I/O in actions and math in memos.
            </p>
          </Card>
        </section>

        <section style="margin:52px 0 72px; padding-top:28px; display:flex; flex-wrap:wrap; align-items:baseline; justify-content:space-between; gap:14px;">
          <p style="font-family:var(--sans); font-size:16px; line-height:1.6; color:var(--granite); margin:0; max-width:52ch;">
            The code is on GitHub and published to npm as <C>pimas-ui</C>. Pre-1.0: pin exact versions.
          </p>
          <a href="https://github.com/noahhyden/pimas" target="_blank" rel="noopener" style="font-family:var(--mono); font-size:13px; letter-spacing:.03em; color:var(--falu); padding-bottom:2px; white-space:nowrap;">
            github.com/noahhyden/pimas &rarr;
          </a>
        </section>

      </main>
    </Shell>
  );
}
