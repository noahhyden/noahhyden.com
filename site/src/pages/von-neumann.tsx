import type { PageMeta } from "../design.js";
import { Button, Card } from "../components/primitives.js";
import { Shell } from "../components/Shell.js";

export const meta: PageMeta = {
  path: "/von-neumann/",
  title: "von-neumann - modelling self-replicating space manufacturing",
  description:
    "A monorepo of small, independently runnable, source-checked models of self-replicating space manufacturing, from a single factory to the galaxy.",
};

const h2s =
  "font-family:var(--serif); font-weight:500; font-size:var(--t-xl); line-height:1.12; letter-spacing:-.02em; margin:0 0 18px; max-width:26ch;";
const body =
  "font-family:var(--sans); font-size:var(--t-sm); line-height:1.7; color:var(--ink); margin:0 0 18px; max-width:72ch;";
const link = "color:var(--ocean);";

export default function VonNeumann() {
  return (
    <Shell active={null}>
      <header style="max-width:900px; margin:0 auto; padding:76px 40px 0;">
        <h1 style="font-family:var(--serif); font-weight:500; font-size:var(--t-2xl); line-height:1.06; letter-spacing:-.022em; margin:0; max-width:19ch;">
          The arithmetic of self-replication.
        </h1>
        <p style="font-family:var(--sans); font-size:var(--t-md); line-height:1.64; color:var(--ink); margin:24px 0 0; max-width:66ch;">
          One factory lands on the Moon or an asteroid and builds copies of itself from local material. von-neumann
          models how far that idea holds and where the physics stops it. Each model is small, independently
          runnable and tested, and every number traces to a cited source.
        </p>
        <div style="display:flex; flex-wrap:wrap; gap:14px; margin:30px 0 0;">
          <Button href="https://vn.noahhyden.com" external fill="solid" accent="falu" size="lg">
            vn.noahhyden.com &rarr;
          </Button>
          <Button href="https://github.com/noahhyden/von-neumann" external fill="tonal" size="lg">
            Source on GitHub &rarr;
          </Button>
        </div>
      </header>

      <main style="max-width:900px; margin:0 auto; padding:0 40px 72px;">
        <section style="margin:52px 0;">
          <h2 style={h2s}>One question per model.</h2>
          <p style={body}>
            The repo is a monorepo, one directory per model, with no single giant simulation. The models cover
            closure and replication (how much of itself a factory can build locally), a solar-powered probe,
            power split between making and thinking, launch economics, a small fleet, and a settlement front
            across a star field. A cross-scale module threads one factory through the fleet and the galaxy so their
            replication cadences come from one source. The models run live in the browser on the project site,
            which is built on <a href="/pimas/" style={link}>pimas</a>.
          </p>
        </section>

        <section style="margin:52px 0;">
          <h2 style={h2s}>What the models conclude so far.</h2>
          <p style={body}>
            The repo&rsquo;s findings document collects nine sourced results. Its summary: the leverage of
            self-replication is real, but it is bounded by physical walls that reappear at every scale, and the
            models say which limit binds where. Three of them:
          </p>
          <ul style="list-style:none; margin:0 0 18px; padding:0; display:grid; gap:12px; font-family:var(--sans); font-size:var(--t-sm); line-height:1.7; color:var(--ink); max-width:72ch;">
            <li><Card tone="ground" outline={true} lift={false} pad="sm">A lone factory can make its structure but not its electronics. Chips are the wall.</Card></li>
            <li><Card tone="ground" outline={true} lift={false} pad="sm">Installed mass per launched mass is exactly 1/(1 - closure): about 3x at 67% closure, about 33x at 97%.</Card></li>
            <li><Card tone="ground" outline={true} lift={false} pad="sm">Light-speed coordination costs a median of about 30% of exploration time for nearest-slingshot probes, about 50% for max-boost, and about 0% for powered flight.</Card></li>
          </ul>
          <p style={body}>
            These are order-of-magnitude research results, not forecasts. Where the literature has no value, the
            repo marks the gap instead of filling it. The full list is in{" "}
            <a href="https://github.com/noahhyden/von-neumann/blob/main/docs/FINDINGS.md" target="_blank" rel="noopener" style={link}>FINDINGS.md</a>
            , and the project&rsquo;s papers are listed in the <a href="/#papers" style={link}>papers section</a> on the home page.
          </p>
        </section>

        <section style="margin:52px 0 0; padding-top:28px;">
          <p style="font-family:var(--sans); font-size:var(--t-xs); line-height:1.64; color:var(--granite); margin:0 0 10px; max-width:72ch;">
            Cite it with DOI{" "}
            <a href="https://doi.org/10.5281/zenodo.21249296" target="_blank" rel="noopener" style={link}>10.5281/zenodo.21249296</a>.
            The code is under the PolyForm Strict License 1.0.0 and the written research under CC BY-NC-ND 4.0.
          </p>
        </section>
      </main>
    </Shell>
  );
}
