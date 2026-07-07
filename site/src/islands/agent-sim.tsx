/**
 * agent-sim - the live demo for /pimas/. A small country-ranking model runs in a
 * real pimas reactive graph in YOUR browser, wired to a real `createAgentBridge`.
 * Three ways to drive it toward a goal ("get France into the top 2"):
 *
 *   • pimas    - scripted: one `speculateSweep` in a SHADOW; live ranking frozen;
 *     one commit. 0 wrong live states.
 *   • ordinary - scripted: must COMMIT each probe to observe it; the live ranking
 *     thrashes through wrong states.
 *   • Live AI  - a REAL LLM (through a key-holding relay) drives the same tools.
 *     Its "hands" (get_ranking / simulate_* / set_weight) execute right here
 *     against the real pimas bridge; only the model call leaves the browser.
 *
 * The speculation is always real pimas (store copy-on-write shadow). Pure module
 * (no import side effects) so SSR bakes the baseline as static HTML; claim adopts.
 */
import { createSignal, createMemo } from "pimas-ui";
import { createStore } from "pimas-ui/store";
import { createAgentBridge } from "pimas-ui/agent";
import type { Child } from "pimas-ui/dom";
import { runLiveAgent, type LiveTool } from "./live-agent.js";

interface Country { name: string; innovation: number; governance: number; sustainability: number; }
const DATA: Country[] = [
  { name: "Sweden", innovation: 88, governance: 84, sustainability: 40 },
  { name: "Germany", innovation: 80, governance: 78, sustainability: 48 },
  { name: "Spain", innovation: 64, governance: 60, sustainability: 66 },
  { name: "France", innovation: 52, governance: 50, sustainability: 95 },
];
const GOAL_UNIT = "France";
const PILLARS = ["innovation", "governance", "sustainability"] as const;
const GRID = [2, 4, 8]; // upweight-only: only sustainability@{2,4,8} lift France into the top 2

// Production relay endpoint (Cloudflare Worker). Empty until deployed - Live AI
// falls back gracefully. Override locally with window.__PIMAS_PROXY__.
const PROXY_URL = "";

const mono = "font-family:var(--mono);";

export default function AgentSim(): Child {
  const [w, setW] = createStore<Record<string, number>>({ innovation: 1, governance: 1, sustainability: 1 });
  const score = (c: Country) => c.innovation * w.innovation + c.governance * w.governance + c.sustainability * w.sustainability;
  const ranking = createMemo(() => {
    const rows = DATA.map((c) => ({ name: c.name, score: score(c) }));
    rows.sort((a, b) => b.score - a.score);
    return rows.map((r, i) => ({ ...r, rank: i + 1 }));
  });
  const maxScore = createMemo(() => Math.max(...ranking().map((r) => r.score)));
  const order = () => ranking().map((x) => x.name);
  const topUnit = () => ranking()[0]!.name;
  // Goal is "France into the top 2" - met when the goal unit's rank is <= 2.
  const goalRank = () => ranking().find((r) => r.name === GOAL_UNIT)?.rank ?? 99;
  const goalMet = () => goalRank() <= 2;
  const orderMeetsGoal = (units: string[]) => units.slice(0, 2).includes(GOAL_UNIT);

  const bridge = createAgentBridge((r) => {
    r.expose("ranking", () => ranking().map((x) => ({ unit: x.name, rank: x.rank })));
    r.action("setWeight", (p, val) => setW(p as string, val as number), { params: ["pillar", "weight"] });
  });

  type Mode = "pimas" | "ordinary" | "live";
  const [mode, setMode] = createSignal<Mode>("pimas");
  const [running, setRunning] = createSignal(false);
  const [done, setDone] = createSignal(false);
  const [calls, setCalls] = createSignal(0);
  const [writes, setWrites] = createSignal(0);
  const [wrong, setWrong] = createSignal(0);
  const [sims, setSims] = createSignal(0);
  const [tokens, setTokens] = createSignal(0);
  const [log, setLog] = createSignal<Array<{ t: string; tone: "plain" | "ok" | "wrong" }>>([]);
  const [shadow, setShadow] = createSignal<{ label: string; ok: boolean } | null>(null);
  const [flash, setFlash] = createSignal<"none" | "wrong" | "ok">("none");
  const [goal, setGoal] = createSignal("Get France into the top 2 by changing a single pillar weight.");
  const [note, setNote] = createSignal("");

  const reduced = () => typeof matchMedia !== "undefined" && matchMedia("(prefers-reduced-motion: reduce)").matches;
  const wait = (ms: number) => new Promise<void>((res) => setTimeout(res, reduced() ? 0 : ms));
  const addLog = (t: string, tone: "plain" | "ok" | "wrong" = "plain") => setLog([...log(), { t, tone }].slice(-8));
  const reset = () => { setW("innovation", 1); setW("governance", 1); setW("sustainability", 1); };
  const candidates = () => PILLARS.flatMap((p) => GRID.map((g) => [p, g] as [string, number]));
  function clear() {
    reset(); setLog([]); setShadow(null); setFlash("none"); setNote("");
    setCalls(0); setWrites(0); setWrong(0); setSims(0); setTokens(0); setDone(false);
  }

  // ── scripted: pimas (one shadow sweep) ──
  async function runPimas() {
    clear();
    const cands = candidates();
    addLog(`simulate_sweep("setWeight", ${cands.length} candidates)`);
    const res = bridge.speculateSweep("setWeight", cands) as Array<{ ranking: Array<{ unit: string; rank: number }> }>;
    setCalls(1); setSims(cands.length);
    let answer: [string, number] | null = null;
    for (let i = 0; i < cands.length; i++) {
      const [p, g] = cands[i]!;
      const fr = res[i]!.ranking.find((r) => r.unit === GOAL_UNIT)!;
      const ok = fr.rank <= 2;
      setShadow({ label: `${p} = ${g}  →  France #${fr.rank}`, ok });
      if (ok && !answer) answer = [p, g];
      await wait(300);
    }
    setShadow(null);
    if (answer) {
      addLog(`commit("setWeight", ${answer[0]}, ${answer[1]})`, "ok");
      bridge.call("setWeight", answer[0], answer[1]); setWrites(1); setFlash("ok");
    }
    setDone(true);
  }

  // ── scripted: ordinary (commit each probe) ──
  async function runOrdinary() {
    clear();
    let answer: [string, number] | null = null;
    for (const [p, g] of candidates()) {
      bridge.call("setWeight", p, g); setCalls(calls() + 2); setWrites(writes() + 1);
      const ok = goalMet();
      addLog(`setWeight(${p}, ${g})  →  France #${goalRank()}`, ok ? "ok" : "wrong");
      if (ok) { answer = [p, g]; setFlash("ok"); await wait(420); break; }
      setWrong(wrong() + 1); setFlash("wrong");
      await wait(340);
      reset(); setWrites(writes() + 1); setFlash("none");
      await wait(110);
    }
    setDone(!!answer);
  }

  // ── live: a real LLM through the relay ──
  const liveTools = (): LiveTool[] => [
    {
      decl: { name: "get_ranking", description: "The current committed ranking, best to worst.", parameters: { type: "object", properties: {} } },
      run: () => { setCalls(calls() + 1); return { ranking: order() }; },
    },
    {
      decl: {
        name: "simulate_sweep",
        description: "PREDICT the ranking at several weights for ONE pillar at once, WITHOUT committing. Nothing changes.",
        parameters: { type: "object", properties: { pillar: { type: "string", enum: [...PILLARS] }, weights: { type: "array", items: { type: "number" } } }, required: ["pillar", "weights"] },
      },
      run: (a) => {
        setCalls(calls() + 1);
        const weights = (a.weights as number[]) ?? [];
        const res = bridge.speculateSweep("setWeight", weights.map((g) => [a.pillar, g])) as Array<{ ranking: Array<{ unit: string }> }>;
        setSims(sims() + weights.length);
        const anyOk = res.some((pt) => orderMeetsGoal(pt.ranking.map((r) => r.unit)));
        setShadow({ label: `swept ${a.pillar} (${weights.length}) - live untouched`, ok: anyOk });
        return { points: weights.map((g, i) => ({ weight: g, ranking: res[i]!.ranking.map((r) => r.unit) })) };
      },
    },
    {
      decl: {
        name: "simulate_config",
        description: "PREDICT the ranking for a set of pillar weights, WITHOUT committing. Nothing changes.",
        parameters: { type: "object", properties: { innovation: { type: "number" }, governance: { type: "number" }, sustainability: { type: "number" } } },
      },
      run: (a) => {
        setCalls(calls() + 1);
        const steps: Array<[string, ...unknown[]]> = [];
        for (const p of PILLARS) if (a[p] != null) steps.push(["setWeight", p, a[p]]);
        const s = bridge.speculatePlan(steps) as { ranking: Array<{ unit: string; rank: number }> };
        setSims(sims() + 1);
        const fr = s.ranking.find((r) => r.unit === GOAL_UNIT);
        setShadow({ label: `config → France #${fr?.rank ?? "-"} - live untouched`, ok: !!fr && fr.rank <= 2 });
        return { ranking: s.ranking.map((r) => r.unit) };
      },
    },
    {
      decl: {
        name: "set_weight",
        description: "REALLY set a pillar's weight - this changes the live model everyone sees.",
        parameters: { type: "object", properties: { pillar: { type: "string", enum: [...PILLARS] }, weight: { type: "number" } }, required: ["pillar", "weight"] },
      },
      run: (a) => {
        setCalls(calls() + 1); setWrites(writes() + 1);
        bridge.call("setWeight", a.pillar, a.weight);
        setFlash(goalMet() ? "ok" : "wrong");
        return { ranking: order() };
      },
    },
    {
      decl: {
        name: "submit_answer",
        description: "Finish. Give the pillar+weight you applied, or impossible=true, and a short note.",
        parameters: { type: "object", properties: { pillar: { type: "string" }, weight: { type: "number" }, impossible: { type: "boolean" }, note: { type: "string" } } },
      },
      run: (a) => { setCalls(calls() + 1); if (a.note) setNote(String(a.note)); return { ok: true }; },
    },
  ];

  function liveSystem(g: string): string {
    return (
      "You control an OECD-style composite-indicator model through tools. Countries: Sweden, Germany, Spain, France. " +
      "Each has hidden sub-scores in three pillars - innovation, governance, sustainability. The composite is a " +
      "weighted sum of the pillars; every weight starts at 1; the ranking is by composite, highest first.\n\n" +
      "Weights can be any positive number - try a wide range like 0.5, 2, 4, 8, 16, not tiny nudges. " +
      "Prefer simulate_sweep to test several weights of ONE pillar in a single call. Explore with the " +
      "simulate_* tools first - they predict a ranking WITHOUT changing the live model. Only call set_weight " +
      "to apply your FINAL answer (it mutates the live model everyone sees), then call submit_answer. Keep the " +
      "live model clean - do your searching in simulation.\n\nTask: " + g
    );
  }

  async function runLive() {
    clear();
    const proxy = (typeof window !== "undefined" && (window as unknown as { __PIMAS_PROXY__?: string }).__PIMAS_PROXY__) || PROXY_URL;
    if (!proxy) {
      setNote("Live AI needs the key-holding relay, which isn't wired on this deploy yet - see relay/README in the repo. Meanwhile the scripted pimas and ordinary agents above run with zero setup.");
      addLog("relay not configured", "wrong");
      return;
    }
    addLog(`live LLM · goal: ${goal().slice(0, 48)}${goal().length > 48 ? "…" : ""}`);
    try {
      const r = await runLiveAgent({
        proxyUrl: proxy,
        system: liveSystem(goal()),
        tools: liveTools(),
        stepCap: 12,
        onStep: (s) => {
          const a = JSON.stringify(s.args);
          addLog(`${s.name}(${a.length > 40 ? a.slice(0, 38) + "…}" : a})`, s.name === "set_weight" ? "wrong" : s.name === "submit_answer" ? "ok" : "plain");
        },
        onText: (t) => t && setNote(t.slice(0, 240)),
      });
      setTokens(r.tokens);
      setShadow(null);
      if (r.answer) { if (!note()) setNote(String(r.answer.note ?? "")); setFlash(goalMet() ? "ok" : "none"); setDone(true); }
      else { addLog("stopped without submitting", "wrong"); }
    } catch (e) {
      setNote("Live AI is resting (the relay hit its rate limit or is offline). Try the scripted agents above - they always run.");
      addLog(`relay: ${String((e as Error).message).slice(0, 60)}`, "wrong");
    }
  }

  async function run() {
    if (running()) return;
    setRunning(true);
    try { await (mode() === "pimas" ? runPimas() : mode() === "ordinary" ? runOrdinary() : runLive()); }
    finally { setRunning(false); }
  }

  // ── render ──
  const modeBtn = (m: Mode, labelTxt: string) => (
    <button type="button" onClick={() => { if (!running()) { setMode(m); clear(); } }}
      style={() => `${mono} font-size:12px; padding:8px 13px; border-radius:2px; cursor:pointer; ` +
        (mode() === m ? "background:var(--ink); color:var(--ground); border:1px solid var(--ink);" : "background:transparent; color:var(--granite); border:1px solid var(--line);")}>
      {labelTxt}
    </button>
  );

  const stat = (labelTxt: string, get: () => number, danger?: boolean) => (
    <div style="flex:1 1 76px;">
      <div style={() => `${mono} font-size:23px; font-weight:700; font-variant-numeric:tabular-nums; color:${danger && get() > 0 ? "var(--falu)" : "var(--ink)"};`}>{() => String(get())}</div>
      <div style="font-family:var(--sans); font-size:12px; color:var(--granite); margin-top:3px;">{labelTxt}</div>
    </div>
  );

  function rankRow(r: { name: string; score: number; rank: number }): Child {
    const isGoal = r.name === GOAL_UNIT, isTop = r.rank === 1;
    const barColor = isGoal ? "var(--ocean)" : isTop ? "var(--laurel)" : "var(--granite)";
    const pct = Math.round((r.score / maxScore()) * 100);
    return (
      <div style="display:flex; align-items:center; gap:12px; padding:6px 0;">
        <span style={`${mono} font-size:12px; width:20px; color:${isTop ? "var(--ink)" : "var(--granite)"}; font-weight:${isTop ? "700" : "400"};`}>#{String(r.rank)}</span>
        <span style={`font-family:var(--sans); font-size:14px; width:74px; color:var(--ink); font-weight:${isGoal ? "600" : "400"};`}>{r.name}</span>
        <span style="flex:1; height:10px; background:var(--surface); border-radius:2px; overflow:hidden;"><span style={`display:block; height:100%; width:${pct}%; background:${barColor}; transition:width .28s ease;`} /></span>
        <span style={`${mono} font-size:11px; width:40px; text-align:right; color:var(--granite); font-variant-numeric:tabular-nums;`}>{String(Math.round(r.score))}</span>
      </div>
    );
  }

  return (
    <div style="border:1px solid var(--line); border-radius:4px; background:var(--ground); padding:22px;">
      <div style="display:flex; align-items:baseline; justify-content:space-between; flex-wrap:wrap; gap:12px; margin-bottom:6px;">
        <div style={`${mono} font-size:11px; letter-spacing:.14em; text-transform:uppercase; color:var(--granite);`}>Live demo - an agent using it</div>
        <div style="display:flex; gap:7px; flex-wrap:wrap;">{modeBtn("pimas", "pimas agent")}{modeBtn("ordinary", "ordinary agent")}{modeBtn("live", "live AI")}</div>
      </div>
      <p style="font-family:var(--sans); font-size:14px; line-height:1.55; color:var(--granite); margin:0 0 16px; max-width:62ch;">
        {() => mode() === "live"
          ? "A real language model drives the same tools. Its what-ifs run in a shadow; watch whether it keeps the live model clean."
          : "Goal: get France into the top 2 by re-weighting one pillar. Same task, two agents. Watch the live model on the left."}
      </p>

      {/* goal input (live only) */}
      {() => mode() === "live" ? (
        <div style="margin-bottom:16px;">
          <div style={`${mono} font-size:10px; letter-spacing:.12em; text-transform:uppercase; color:var(--granite); margin-bottom:6px;`}>the agent&rsquo;s goal (edit it)</div>
          <input value={goal()} onInput={(e: Event) => setGoal((e.currentTarget as HTMLInputElement).value)}
            style="width:100%; box-sizing:border-box; font-family:var(--sans); font-size:14px; color:var(--ink); background:var(--ground); border:1px solid var(--granite); border-radius:2px; padding:9px 11px;" />
        </div>
      ) : null}

      <div style="display:flex; gap:18px; align-items:stretch; flex-wrap:wrap;">
        {/* live model */}
        <div style={() => "flex:1 1 300px; border-radius:3px; padding:16px; transition:background .2s, border-color .2s; border:1.5px solid " +
          (flash() === "wrong" ? "var(--falu); background:rgba(128,24,24,.06);" : flash() === "ok" ? "var(--laurel); background:rgba(59,91,71,.07);" : "var(--line); background:var(--ground);")}>
          <div style={`${mono} font-size:10px; letter-spacing:.12em; text-transform:uppercase; color:var(--granite); margin-bottom:10px;`}>live model {() => (flash() === "ok" ? "· goal met" : flash() === "wrong" ? "· wrong state" : "")}</div>
          {() => ranking().map((r) => rankRow(r))}
        </div>

        {/* agent side */}
        <div style="flex:1 1 260px; display:flex; flex-direction:column; gap:13px;">
          <div style="display:flex; gap:10px;">
            {stat("tool calls", calls)}
            {stat("live writes", writes)}
            {/* third stat: wrong states (scripted) or shadow evals (live) */}
            <div style="flex:1 1 76px;">
              <div style={() => `${mono} font-size:23px; font-weight:700; font-variant-numeric:tabular-nums; color:${mode() !== "live" && wrong() > 0 ? "var(--falu)" : "var(--ink)"};`}>{() => String(mode() === "live" ? sims() : wrong())}</div>
              <div style="font-family:var(--sans); font-size:12px; color:var(--granite); margin-top:3px;">{() => mode() === "live" ? "shadow evals" : "wrong live states"}</div>
            </div>
          </div>

          {/* shadow panel */}
          {() => {
            const s = shadow();
            return (
              <div style={`border:1.5px dashed ${s ? "var(--ocean)" : "var(--line)"}; border-radius:3px; padding:10px 12px; min-height:42px; background:${s ? "rgba(59,86,105,.06)" : "transparent"};`}>
                <div style={`${mono} font-size:9px; letter-spacing:.14em; text-transform:uppercase; color:var(--ocean); margin-bottom:4px;`}>shadow &middot; nothing committed</div>
                <div style={`${mono} font-size:12px; color:${s ? (s.ok ? "var(--laurel)" : "var(--ocean)") : "var(--granite)"};`}>{() => { const c = shadow(); return c ? c.label + (c.ok ? "  (ok)" : "") : "idle"; }}</div>
              </div>
            );
          }}

          {/* agent log */}
          <div style="border:1px solid var(--line); border-radius:3px; background:var(--surface); padding:10px 12px; min-height:90px; flex:1;">
            <div style={`${mono} font-size:9px; letter-spacing:.14em; text-transform:uppercase; color:var(--granite); margin-bottom:6px;`}>agent log {() => (tokens() > 0 ? `· ${tokens()} tokens` : "")}</div>
            {() => log().length === 0
              ? <div style={`${mono} font-size:12px; color:var(--granite);`}>press Run &rarr;</div>
              : log().map((l) => <div style={`${mono} font-size:11.5px; line-height:1.5; color:${l.tone === "ok" ? "var(--laurel)" : l.tone === "wrong" ? "var(--falu)" : "var(--ink)"}; word-break:break-word;`}>{l.t}</div>)}
          </div>

          <button type="button" onClick={run}
            style={() => `${mono} font-size:13px; padding:11px 18px; border-radius:2px; border:1px solid var(--laurel); ` +
              (running() ? "background:var(--granite); border-color:var(--granite); color:var(--ground); cursor:default;" : "background:var(--laurel); color:var(--ground); cursor:pointer;")}>
            {() => running() ? (mode() === "live" ? "the model is thinking…" : "running…") : done() ? "run again" : mode() === "live" ? "run the live AI agent" : `run the ${mode()} agent`}
          </button>
        </div>
      </div>

      {/* note / result line */}
      {() => note() ? <p style="font-family:var(--sans); font-size:13px; line-height:1.55; color:var(--ink); margin:14px 0 0; padding:11px 13px; background:var(--surface); border-radius:3px; border-left:2px solid var(--ocean);">{note()}</p> : null}

      <p style="font-family:var(--sans); font-size:12px; line-height:1.55; color:var(--granite); margin:14px 0 0;">
        {() => mode() === "live"
          ? "The model runs remotely through a key-holding relay; its tools execute here against the real pimas graph - the speculation never leaves your browser."
          : "This runs pimas in your browser - the same speculate the framework ships. The scripted policy is fixed; the shadow evaluation is real (nothing commits until the final commit)."}
      </p>
    </div>
  );
}
