/**
 * agent-sim — the live demo for /pimas/. A small country-ranking model runs in a
 * real pimas reactive graph in YOUR browser, wired to a real `createAgentBridge`.
 * A scripted "agent" chases a goal ("get Poland to #1") two ways:
 *
 *   • ordinary — must COMMIT each probe to observe it: the live ranking visibly
 *     thrashes through wrong states, and the wrong-state counter climbs.
 *   • pimas    — one `bridge.speculateSweep(...)`: every candidate is evaluated
 *     in a SHADOW; the live ranking never moves; one real commit at the end.
 *
 * The agent policy is scripted, but the speculation is REAL — this island ships
 * and runs pimas/agent's `speculateSweep`/`call` (store copy-on-write shadow).
 * Pure module (no import side effects) so SSR bakes the baseline state as static
 * HTML and the client claims it.
 */
import { createSignal, createMemo } from "pimas";
import { createStore } from "pimas/store";
import { createAgentBridge } from "pimas/agent";
import type { Child } from "pimas/dom";

interface Country { name: string; capacity: number; transparency: number; competition: number; }
const DATA: Country[] = [
  { name: "Sweden", capacity: 90, transparency: 82, competition: 42 },
  { name: "Germany", capacity: 76, transparency: 70, competition: 60 },
  { name: "Spain", capacity: 62, transparency: 66, competition: 72 },
  { name: "Poland", capacity: 44, transparency: 52, competition: 96 },
];
const GOAL = "Poland";
const PILLARS = ["capacity", "transparency", "competition"] as const;
const GRID = [2, 4, 8]; // upweight-only: the ONLY winners are competition@{2,4,8}
// (so the ordinary agent must probe through capacity+transparency first — wrong states).

const mono = "font-family:var(--mono);";

export default function AgentSim(): Child {
  // ── the model: pillar weights (a store), composite + ranking (memos) ──
  const [w, setW] = createStore<Record<string, number>>({ capacity: 1, transparency: 1, competition: 1 });
  const score = (c: Country) => c.capacity * w.capacity + c.transparency * w.transparency + c.competition * w.competition;
  const ranking = createMemo(() => {
    const rows = DATA.map((c) => ({ name: c.name, score: score(c) }));
    rows.sort((a, b) => b.score - a.score);
    return rows.map((r, i) => ({ ...r, rank: i + 1 }));
  });
  const maxScore = createMemo(() => Math.max(...ranking().map((r) => r.score)));
  const topUnit = () => ranking()[0]!.name;

  // ── the agent surface (real) ──
  const bridge = createAgentBridge((r) => {
    r.expose("ranking", () => ranking().map((x) => ({ unit: x.name, rank: x.rank })));
    r.action("setWeight", (p, val) => setW(p as string, val as number), { params: ["pillar", "weight"] });
  });

  // ── demo UI state ──
  const [mode, setMode] = createSignal<"pimas" | "ordinary">("pimas");
  const [running, setRunning] = createSignal(false);
  const [done, setDone] = createSignal(false);
  const [calls, setCalls] = createSignal(0);
  const [commits, setCommits] = createSignal(0);
  const [wrong, setWrong] = createSignal(0);
  const [log, setLog] = createSignal<Array<{ t: string; tone: "plain" | "ok" | "wrong" }>>([]);
  const [shadow, setShadow] = createSignal<{ label: string; ok: boolean } | null>(null);
  const [flash, setFlash] = createSignal<"none" | "wrong" | "ok">("none");

  const reduced = () => typeof matchMedia !== "undefined" && matchMedia("(prefers-reduced-motion: reduce)").matches;
  const wait = (ms: number) => new Promise<void>((res) => setTimeout(res, reduced() ? 0 : ms));
  const addLog = (t: string, tone: "plain" | "ok" | "wrong" = "plain") => setLog([...log(), { t, tone }].slice(-7));
  const reset = () => { setW("capacity", 1); setW("transparency", 1); setW("competition", 1); };
  const candidates = () => PILLARS.flatMap((p) => GRID.map((g) => [p, g] as [string, number]));

  function clear() {
    reset(); setLog([]); setShadow(null); setFlash("none");
    setCalls(0); setCommits(0); setWrong(0); setDone(false);
  }

  // pimas agent: one shadow sweep over all candidates; live model never moves.
  async function runPimas() {
    clear();
    const cands = candidates();
    addLog(`simulate_sweep("setWeight", ${cands.length} candidates)`, "plain");
    const res = bridge.speculateSweep("setWeight", cands) as Array<{ ranking: Array<{ unit: string; rank: number }> }>;
    setCalls(1);
    let answer: [string, number] | null = null;
    for (let i = 0; i < cands.length; i++) {
      const [p, g] = cands[i]!;
      const ok = res[i]!.ranking[0]!.unit === GOAL;
      setShadow({ label: `${p} = ${g}  →  ${res[i]!.ranking[0]!.unit} #1`, ok });
      if (ok && !answer) answer = [p, g];
      await wait(300);
    }
    setShadow(null);
    if (answer) {
      addLog(`commit("setWeight", ${answer[0]}, ${answer[1]})`, "ok");
      bridge.call("setWeight", answer[0], answer[1]);
      setCommits(1);
      setFlash("ok");
    }
    setDone(true);
  }

  // ordinary agent: commit each probe to observe it — the live model thrashes.
  async function runOrdinary() {
    clear();
    let answer: [string, number] | null = null;
    for (const [p, g] of candidates()) {
      bridge.call("setWeight", p, g); // REAL mutation, just to see the result
      setCalls(calls() + 2); // set + read
      setCommits(commits() + 1);
      const ok = topUnit() === GOAL;
      addLog(`setWeight(${p}, ${g})  →  ${topUnit()} #1`, ok ? "ok" : "wrong");
      if (ok) { answer = [p, g]; setFlash("ok"); await wait(420); break; }
      setWrong(wrong() + 1); setFlash("wrong");
      await wait(340);
      reset(); setCommits(commits() + 1); setFlash("none"); // undo to try the next — another write
      await wait(110);
    }
    setDone(!!answer);
  }

  async function run() {
    if (running()) return;
    setRunning(true);
    try { await (mode() === "pimas" ? runPimas() : runOrdinary()); }
    finally { setRunning(false); }
  }

  // ── render helpers ──
  const modeBtn = (m: "pimas" | "ordinary", labelTxt: string) => (
    <button
      type="button"
      onClick={() => { if (!running()) { setMode(m); clear(); } }}
      style={() =>
        `${mono} font-size:12px; padding:8px 14px; border-radius:2px; cursor:pointer; ` +
        (mode() === m
          ? "background:var(--ink); color:var(--ground); border:1px solid var(--ink);"
          : "background:transparent; color:var(--granite); border:1px solid var(--line);")
      }
    >
      {labelTxt}
    </button>
  );

  const stat = (label: string, get: () => number, danger?: boolean) => (
    <div style="flex:1 1 90px;">
      <div style={() => `${mono} font-size:24px; font-weight:700; font-variant-numeric:tabular-nums; color:${danger && get() > 0 ? "var(--falu)" : "var(--ink)"};`}>
        {() => String(get())}
      </div>
      <div style="font-family:var(--sans); font-size:12px; color:var(--granite); margin-top:3px;">{label}</div>
    </div>
  );

  function rankRow(r: { name: string; score: number; rank: number }): Child {
    const isGoal = r.name === GOAL;
    const isTop = r.rank === 1;
    const barColor = isGoal ? "var(--ocean)" : isTop ? "var(--laurel)" : "var(--granite)";
    const pct = Math.round((r.score / maxScore()) * 100);
    return (
      <div style="display:flex; align-items:center; gap:12px; padding:6px 0;">
        <span style={`${mono} font-size:12px; width:20px; color:${isTop ? "var(--ink)" : "var(--granite)"}; font-weight:${isTop ? "700" : "400"};`}>#{String(r.rank)}</span>
        <span style={`font-family:var(--sans); font-size:14px; width:74px; color:var(--ink); font-weight:${isGoal ? "600" : "400"};`}>{r.name}</span>
        <span style="flex:1; height:10px; background:var(--surface); border-radius:2px; overflow:hidden;">
          <span style={`display:block; height:100%; width:${pct}%; background:${barColor}; transition:width .28s ease;`} />
        </span>
        <span style={`${mono} font-size:11px; width:40px; text-align:right; color:var(--granite); font-variant-numeric:tabular-nums;`}>{String(Math.round(r.score))}</span>
      </div>
    );
  }

  return (
    <div style="border:1px solid var(--line); border-radius:4px; background:var(--ground); padding:22px;">
      <div style="display:flex; align-items:baseline; justify-content:space-between; flex-wrap:wrap; gap:12px; margin-bottom:4px;">
        <div style={`${mono} font-size:11px; letter-spacing:.14em; text-transform:uppercase; color:var(--granite);`}>Live demo &mdash; an agent using it</div>
        <div style="display:flex; gap:8px;">{modeBtn("pimas", "pimas agent")}{modeBtn("ordinary", "ordinary agent")}</div>
      </div>
      <p style="font-family:var(--sans); font-size:14px; line-height:1.55; color:var(--granite); margin:0 0 18px; max-width:60ch;">
        Goal: <b style="color:var(--ink);">get Poland to&nbsp;#1</b> by re-weighting one pillar. Same task, two agents. Watch the <b style="color:var(--ink);">live model</b> on the left.
      </p>

      <div style="display:flex; gap:18px; align-items:stretch; flex-wrap:wrap;">
        {/* live model */}
        <div style={() =>
          "flex:1 1 300px; border-radius:3px; padding:16px; transition:background .2s, border-color .2s; border:1.5px solid " +
          (flash() === "wrong" ? "var(--falu); background:rgba(128,24,24,.06);" : flash() === "ok" ? "var(--laurel); background:rgba(59,91,71,.07);" : "var(--line); background:var(--ground);")
        }>
          <div style={`${mono} font-size:10px; letter-spacing:.12em; text-transform:uppercase; color:var(--granite); margin-bottom:10px;`}>live model {() => (flash() === "ok" ? "· goal met ✓" : flash() === "wrong" ? "· wrong state" : "")}</div>
          {() => ranking().map((r) => rankRow(r))}
        </div>

        {/* agent side */}
        <div style="flex:1 1 260px; display:flex; flex-direction:column; gap:14px;">
          <div style="display:flex; gap:10px; text-align:left;">
            {stat("tool calls", calls)}
            {stat("live writes", commits)}
            {stat("wrong live states", wrong, true)}
          </div>

          {/* shadow panel (pimas) */}
          {() => {
            const s = shadow();
            return (
              <div style={`border:1.5px dashed ${s ? "var(--ocean)" : "var(--line)"}; border-radius:3px; padding:11px 13px; min-height:44px; background:${s ? "rgba(59,86,105,.06)" : "transparent"};`}>
                <div style={`${mono} font-size:9px; letter-spacing:.14em; text-transform:uppercase; color:var(--ocean); margin-bottom:4px;`}>shadow &middot; nothing committed</div>
                <div style={`${mono} font-size:12px; color:${s ? (s.ok ? "var(--laurel)" : "var(--ocean)") : "var(--granite)"};`}>
                  {() => { const c = shadow(); return c ? c.label + (c.ok ? "  ✓" : "") : "idle"; }}
                </div>
              </div>
            );
          }}

          {/* agent log */}
          <div style="border:1px solid var(--line); border-radius:3px; background:var(--surface); padding:11px 13px; min-height:96px; flex:1;">
            <div style={`${mono} font-size:9px; letter-spacing:.14em; text-transform:uppercase; color:var(--granite); margin-bottom:6px;`}>agent log</div>
            {() => log().length === 0
              ? <div style={`${mono} font-size:12px; color:var(--granite);`}>press Run &rarr;</div>
              : log().map((l) => (
                  <div style={`${mono} font-size:11.5px; line-height:1.5; color:${l.tone === "ok" ? "var(--laurel)" : l.tone === "wrong" ? "var(--falu)" : "var(--ink)"};`}>{l.t}</div>
                ))}
          </div>

          <button
            type="button"
            onClick={run}
            style={() =>
              `${mono} font-size:13px; padding:11px 18px; border-radius:2px; border:1px solid var(--laurel); ` +
              (running() ? "background:var(--granite); border-color:var(--granite); color:var(--ground); cursor:default;" : "background:var(--laurel); color:var(--ground); cursor:pointer;")
            }
          >
            {() => (running() ? "running…" : done() ? "run again" : `run the ${mode()} agent`)}
          </button>
        </div>
      </div>

      <p style="font-family:var(--sans); font-size:12px; line-height:1.55; color:var(--granite); margin:16px 0 0;">
        This runs pimas in your browser &mdash; the same <span style={`${mono} color:var(--ocean);`}>speculate</span> the framework ships. The agent&rsquo;s policy is scripted; the shadow evaluation is real (nothing commits until the final <span style={`${mono};`}>commit</span>).
      </p>
    </div>
  );
}
