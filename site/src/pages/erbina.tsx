import type { PageMeta } from "../design.js";
import { Shell } from "../components/Shell.js";
import { Button } from "../components/primitives.js";

export const meta: PageMeta = {
  path: "/erbina/",
  title: "erbina - install by asking, proven by running",
  description:
    "An MCP server that installs, wires and verifies developer tools from curated recipes. It shows you every command before it runs, and proves an install by running the tool.",
};

const h2s =
  "font-family:var(--serif); font-weight:500; font-size:31px; line-height:1.12; letter-spacing:-.02em; margin:0 0 18px; max-width:26ch;";
const body =
  "font-family:var(--sans); font-size:16px; line-height:1.7; color:var(--ink); margin:0 0 18px; max-width:72ch;";
const link = "color:var(--ocean); border-bottom:1px solid var(--ocean);";
const mono = "font-family:var(--mono); font-size:.86em; color:var(--ocean); white-space:nowrap;";

export default function Erbina() {
  return (
    <Shell active={null}>
      <header style="max-width:900px; margin:0 auto; padding:76px 40px 0;">
        <h1 style="font-family:var(--serif); font-weight:500; font-size:50px; line-height:1.06; letter-spacing:-.022em; margin:0; max-width:19ch;">
          Install by asking. Proven by running.
        </h1>
        <p style="font-family:var(--sans); font-size:17px; line-height:1.64; color:var(--ink); margin:24px 0 0; max-width:66ch;">
          erbina is an MCP server for Claude Code. You ask for a tool; it shows you the exact commands first,
          installs through whichever package manager your machine actually has, then proves the tool works by
          running it. The registry is curated YAML, and the server is a single <span style={mono}>server.py</span>.
        </p>
        <div style="display:flex; flex-wrap:wrap; gap:14px; margin:30px 0 0;">
          <Button href="https://github.com/noahhyden/erbina" external={true} fill="none" accent="falu" size="lg" outline={true}>
            Source on GitHub &rarr;
          </Button>
        </div>
      </header>

      <main style="max-width:900px; margin:0 auto; padding:0 40px 72px;">
        <section style="margin:52px 0;">
          <h2 style={h2s}>A recipe is data.</h2>
          <p style={body}>
            One YAML file per tool, holding the phases erbina runs in order: <span style={mono}>detect</span>,{" "}
            <span style={mono}>install</span>, <span style={mono}>configure</span>, <span style={mono}>verify</span>.
            Install methods are listed in preference order, each guarded by the manager it needs, so the same
            recipe resolves to Homebrew on a Mac, winget on Windows and cargo or pipx on a bare Linux box. The
            server handles recipes generically: there is no per-tool code in it, and a recipe that breaks the
            schema is refused at load rather than half-run.
          </p>
        </section>

        <section style="margin:52px 0;">
          <h2 style={h2s}>Verify means run it.</h2>
          <p style={body}>
            A check that a file exists proves a file exists. erbina&rsquo;s registry policy rejects a{" "}
            <span style={mono}>verify</span> that only inspects the filesystem: it has to execute the tool and get
            a zero exit, so a truncated download or a binary that cannot find its own libraries fails the install
            instead of passing it. The same honesty runs backwards through the other phases.{" "}
            <span style={mono}>detect</span> gates installation, so bootstrapping something twice is a no-op rather
            than a reinstall, and <span style={mono}>uninstall</span> re-runs detection afterwards to confirm the
            tool is actually gone.
          </p>
          <p style={body}>
            Nothing executes before you have seen it. Every recipe has a plan surface that renders the exact
            commands without running any of them, and the install path is reachable only after that plan could
            have been shown. It installs software with real privileges, so consent is a structural property, not a
            prompt.
          </p>
        </section>

        <section style="margin:52px 0;">
          <h2 style={h2s}>And what you already have.</h2>
          <p style={body}>
            Claude Code resolves MCP servers across three scopes, and the usual confusion is one name defined in
            two of them. erbina audits all three and names the shadowed ones, health-checks the servers that no
            longer connect so dead entries can be removed from the right scope, and re-runs detection and
            verification over the tools it installed to sort them into healthy, missing and broken. Version checks
            are read-only and comparison is asymmetric: an unparseable version is reported as unknown rather than
            guessed at, and a pinned tool is never offered an update.
          </p>
        </section>

        <section style="margin:52px 0 0; border-top:1px solid var(--line); padding-top:28px;">
          <p style="font-family:var(--sans); font-size:15px; line-height:1.64; color:var(--granite); margin:0 0 10px; max-width:72ch;">
            Apache License 2.0, with the name and logos reserved in a{" "}
            <a href="https://github.com/noahhyden/erbina/blob/main/NOTICE" target="_blank" rel="noopener" style={link}>NOTICE</a>
            {" "}file: as free to fork as before, a fork just needs its own name.
          </p>
        </section>
      </main>
    </Shell>
  );
}
