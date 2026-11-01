import type { PageMeta } from "../design.js";
import { Shell } from "../components/Shell.js";

export const meta: PageMeta = {
  path: "/ataegina/",
  title: "ataegina - collision-free worktrees for parallel agents",
  description:
    "A zero-dependency bash launcher that gives every git worktree its own ports, processes and database, so a fleet of coding agents can run full stacks side by side.",
};

const h2s =
  "font-family:var(--serif); font-weight:500; font-size:31px; line-height:1.12; letter-spacing:-.02em; margin:0 0 18px; max-width:26ch;";
const body =
  "font-family:var(--sans); font-size:16px; line-height:1.7; color:var(--ink); margin:0 0 18px; max-width:72ch;";
const link = "color:var(--ocean); border-bottom:1px solid var(--ocean);";
const mono = "font-family:var(--mono); font-size:.86em; color:var(--ocean); white-space:nowrap;";

export default function Ataegina() {
  return (
    <Shell active={null}>
      <header style="max-width:900px; margin:0 auto; padding:76px 40px 0;">
        <h1 style="font-family:var(--serif); font-weight:500; font-size:50px; line-height:1.06; letter-spacing:-.022em; margin:0; max-width:19ch;">
          Many worktrees. No collisions.
        </h1>
        <p style="font-family:var(--sans); font-size:17px; line-height:1.64; color:var(--ink); margin:24px 0 0; max-width:66ch;">
          Run several coding agents in parallel and they fight over one machine: the same ports, the same dev
          server, one database they stomp in unison. ataegina gives every git worktree its own ports, processes
          and database from a single bash file. No Docker, no daemon, no YAML.
        </p>
        <div style="display:flex; flex-wrap:wrap; gap:14px; margin:30px 0 0;">
          <a href="https://github.com/noahhyden/ataegina-cli" target="_blank" rel="noopener" style="display:inline-flex; align-items:center; gap:9px; font-family:var(--sans); font-weight:500; font-size:15px; padding:13px 24px; border-radius:2px; border:1px solid var(--falu); color:var(--falu);">
            Source on GitHub &rarr;
          </a>
        </div>
      </header>

      <main style="max-width:900px; margin:0 auto; padding:0 40px 72px;">
        <section style="margin:52px 0;">
          <h2 style={h2s}>One index, everything derived.</h2>
          <p style={body}>
            Each worktree is assigned a stable integer, once, and kept in a per-repo registry. Everything else
            falls out of it: the frontend port is <span style={mono}>5173+N</span>, the backend{" "}
            <span style={mono}>8000+N</span>, the log directory and the database name likewise. The mapping is
            sticky, so a long-lived agent keeps the same address across runs, and the primary checkout stays at
            index 0 holding your shared dev database while only the parallel trees fork off it. Deconflicting the
            database on the bare host is the part that otherwise costs a container.
          </p>
        </section>

        <section style="margin:52px 0;">
          <h2 style={h2s}>It knows its own processes.</h2>
          <p style={body}>
            Tracking detached servers is where this gets hard. ataegina records the pid it launched together with
            that process&rsquo;s start time, so a pid the kernel has since recycled cannot fool it into killing a
            stranger. Teardown enumerates the whole process tree before sending a signal, because dev servers
            spawn workers that never hold the socket and orphan to init if you kill only the listener. A port held
            by something it did not start is reported as foreign rather than assumed: <span style={mono}>up</span>{" "}
            declines instead of implying success, and <span style={mono}>down</span> leaves it alone.
          </p>
        </section>

        <section style="margin:52px 0;">
          <h2 style={h2s}>Written to be driven.</h2>
          <p style={body}>
            Every read command speaks JSON, so a supervising agent queries state instead of parsing logs.{" "}
            <span style={mono}>up --wait</span> blocks until the servers it launched actually accept connections
            and exits 75 if they do not, which replaces the usual sleep-and-hope loop with an exit code.{" "}
            <span style={mono}>list --json</span> returns the whole fleet in one array, and{" "}
            <span style={mono}>doctor</span> is read-only with a nonzero exit, so it doubles as a CI gate. It is
            bash 3.2 throughout, which means it runs on a stock macOS shell with nothing installed.
          </p>
        </section>

        <section style="margin:52px 0 0; border-top:1px solid var(--line); padding-top:28px;">
          <p style="font-family:var(--sans); font-size:15px; line-height:1.64; color:var(--granite); margin:0 0 10px; max-width:72ch;">
            Apache License 2.0, with the name and logos reserved in a{" "}
            <a href="https://github.com/noahhyden/ataegina-cli/blob/main/NOTICE" target="_blank" rel="noopener" style={link}>NOTICE</a>
            {" "}file: as free to fork as before, a fork just needs its own name.
          </p>
        </section>
      </main>
    </Shell>
  );
}
