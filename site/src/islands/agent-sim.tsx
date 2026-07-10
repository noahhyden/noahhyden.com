/**
 * agent-sim - the live demo for /pimas/. A small country-ranking model runs in a
 * real pimas reactive graph in YOUR browser, wired to a real `createAgentBridge`.
 * Four ways to drive it toward a goal ("get France into the top 2"):
 *
 *   • you drive - YOU are the agent: pick a pillar, drag its weight, and watch the
 *     predicted ranking update through a real `speculatePlan` (a copy-on-write
 *     shadow) while the committed model on the left provably does NOT move. Commit
 *     applies it for real via `commitPlan`; `explain()` then reports what changed.
 *   • pimas    - scripted: one `speculateSweep` in a SHADOW; live ranking frozen;
 *     one commit. 0 wrong live states.
 *   • ordinary - scripted: must COMMIT each probe to observe it; the live ranking
 *     thrashes through wrong states.
 *   • Live AI  - a REAL LLM (through a key-holding relay) drives the same tools.
 *     Its "hands" (get_ranking / simulate_* / set_weight) execute right here
 *     against the real pimas bridge; only the model call leaves the browser.
 *
 * Below the demo, the same bridge's `descriptor()` (the machine-readable contract)
 * and `subscribe()` (the live delta stream) are shown as real, unedited output.
 *
 * The speculation is always real pimas (store copy-on-write shadow). Pure module
 * (no import side effects) so SSR bakes the baseline as static HTML; claim adopts.
 */
import { createSignal, createMemo, createEffect, untrack, isSpeculating } from "pimas-ui";
import { createStore } from "pimas-ui/store";
import { createAgentBridge } from "pimas-ui/agent";
import type { CauseRecord } from "pimas-ui/agent";
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
// The Live-AI mode dead-ends without the relay, so its button only renders when
// PROXY_URL is set. Flip PROXY_URL to a real endpoint and the button returns.
const LIVE_ENABLED = PROXY_URL !== "";

const mono = "font-family:var(--mono);";

interface Row { name: string; score: number; rank: number; }
interface ExposedRow { unit: string; rank: number; score: number; }

export default function AgentSim(): Child {
  const [w, setW] = createStore<Record<string, number>>({ innovation: 1, governance: 1, sustainability: 1 });

  // ── recompute ledgers (plain, NON-reactive): each time a memo's compute fn
  // actually runs we bump a counter here. isSpeculating() splits real committed
  // runs (rc) from shadow runs inside a speculate (sc). This is the REAL signal
  // the dependency-graph viz lights from - no faked highlights, no invented
  // numbers. Mutating plain objects inside a memo body is safe: nothing reads
  // them reactively, so there is no write-during-compute cycle. ──
  type NodeId = "scores" | "ranking" | "maxScore" | "leader" | "franceRank";
  const NODE_IDS: NodeId[] = ["scores", "ranking", "maxScore", "leader", "franceRank"];
  const zero = (): Record<NodeId, number> => ({ scores: 0, ranking: 0, maxScore: 0, leader: 0, franceRank: 0 });
  const rc = zero(); // committed recomputes
  const sc = zero(); // shadow (speculative) recomputes
  const instrument = <T,>(id: NodeId, fn: () => T): (() => T) =>
    createMemo(() => { const v = fn(); if (isSpeculating()) sc[id]++; else rc[id]++; return v; });

  // The model as a real reactive graph: three weight signals -> `scores` ->
  // `ranking` -> the three exposed outputs (leader, franceRank) plus maxScore.
  const scores = instrument("scores", () =>
    DATA.map((c) => ({ name: c.name, score: c.innovation * w.innovation + c.governance * w.governance + c.sustainability * w.sustainability })));
  const ranking = instrument("ranking", () => {
    const rows = scores().map((r) => ({ ...r }));
    rows.sort((a, b) => b.score - a.score);
    return rows.map((r, i) => ({ ...r, rank: i + 1 }));
  });
  const maxScore = instrument("maxScore", () => Math.max(...ranking().map((r) => r.score)));
  const leaderMemo = instrument("leader", () => ranking()[0]!.name);
  const franceRankMemo = instrument("franceRank", () => ranking().find((r) => r.name === GOAL_UNIT)?.rank ?? 99);

  const order = () => ranking().map((x) => x.name);
  const topUnit = () => leaderMemo();
  // Goal is "France into the top 2" - met when the goal unit's rank is <= 2.
  const goalRank = () => franceRankMemo();
  const goalMet = () => goalRank() <= 2;
  const orderMeetsGoal = (units: string[]) => units.slice(0, 2).includes(GOAL_UNIT);

  const bridge = createAgentBridge((r) => {
    r.expose(
      "ranking",
      () => ranking().map((x) => ({ unit: x.name, rank: x.rank, score: Math.round(x.score) })),
      {
        description: "Countries ordered by composite score, best first.",
        schema: { type: "array", items: { type: "object", properties: { unit: { type: "string" }, rank: { type: "number" }, score: { type: "number" } } } },
      },
    );
    r.expose("leader", () => topUnit(), { description: "The country currently ranked #1.", schema: { type: "string" } });
    r.expose("franceRank", () => goalRank(), { description: "France's current rank (the goal is a rank of 2 or better).", schema: { type: "number" } });
    r.action("setWeight", (p, val) => setW(p as string, val as number), {
      params: ["pillar", "weight"],
      description: "Set one pillar's weight in the composite; the ranking recomputes.",
      input: { type: "object", properties: { pillar: { type: "string", enum: [...PILLARS] }, weight: { type: "number" } }, required: ["pillar", "weight"] },
    });
  });

  // The machine-readable contract, read once from the real bridge (structure is
  // static; the live VALUES are shown by the subscribe() stream below instead).
  const descriptor = bridge.descriptor();

  type Mode = "you" | "pimas" | "ordinary" | "live";
  const [mode, setMode] = createSignal<Mode>("you");
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
  // visitor-driven ("you be the agent") draft lever
  const [draftPillar, setDraftPillar] = createSignal<string>("sustainability");
  const [draftWeight, setDraftWeight] = createSignal<number>(1);
  // L2 causal record of the last real commit, and the live L1 delta stream
  const [explain, setExplain] = createSignal<CauseRecord | null>(null);
  const [deltas, setDeltas] = createSignal<Array<{ t: string; tone: "state" | "cause" }>>([]);

  const reduced = () => typeof matchMedia !== "undefined" && matchMedia("(prefers-reduced-motion: reduce)").matches;
  const wait = (ms: number) => new Promise<void>((res) => setTimeout(res, reduced() ? 0 : ms));
  const addLog = (t: string, tone: "plain" | "ok" | "wrong" = "plain") => setLog([...log(), { t, tone }].slice(-8));
  const reset = () => { setW("innovation", 1); setW("governance", 1); setW("sustainability", 1); };
  const candidates = () => PILLARS.flatMap((p) => GRID.map((g) => [p, g] as [string, number]));
  function clear() {
    reset(); setLog([]); setShadow(null); setFlash("none"); setNote("");
    setCalls(0); setWrites(0); setWrong(0); setSims(0); setTokens(0); setDone(false);
    setExplain(null); setDeltas([]); setDraftPillar("sustainability"); setDraftWeight(1);
  }

  // ── L1: watch the real subscribe() delta stream (browser only; no SSR writes) ──
  const fmtVal = (v: unknown): string =>
    Array.isArray(v) ? v.map((r) => (r && typeof r === "object" && "unit" in (r as object) ? (r as ExposedRow).unit : String(r))).join(" > ") : String(v);
  if (typeof window !== "undefined") {
    bridge.subscribe((e) => {
      if (e.kind === "state") {
        if (e.initial) return; // seed replay - not a change
        setDeltas([{ t: `${e.name} = ${fmtVal(e.value)}`, tone: "state" as const }, ...deltas()].slice(0, 6));
      } else {
        setDeltas([{ t: `${e.action} -> changed [${e.changed.join(", ")}]`, tone: "cause" as const }, ...deltas()].slice(0, 6));
      }
    });
  }

  // ── L3 visitor-driven: predicted after-state via a real shadow, nothing committed ──
  const predicted = createMemo<ExposedRow[]>(() => {
    const p = draftPillar();
    const wt = draftWeight();
    void ranking(); // depend on the committed base so the prediction refreshes after a real commit
    const res = bridge.speculatePlan([["setWeight", p, wt]]) as { ranking: ExposedRow[] };
    return res.ranking;
  });
  const predMax = createMemo(() => Math.max(...predicted().map((r) => r.score)));
  const predGoalRank = () => predicted().find((r) => r.unit === GOAL_UNIT)?.rank ?? 99;
  const dirty = () => draftWeight() !== w[draftPillar()];

  // ── graph-viz state: which nodes recomputed on the last COMMIT (hot / hotW)
  // and which the current SPECULATE touched in a shadow (specHot), read off the
  // real ledgers above by two effects. An effect (not the memo body) does the
  // reactive writes, so the reactive semantics of the model are untouched. ──
  const [counts, setCounts] = createSignal<Record<NodeId, number>>({ ...rc });
  const [hot, setHot] = createSignal<Record<NodeId, boolean>>({} as Record<NodeId, boolean>);
  const [hotW, setHotW] = createSignal<Record<string, boolean>>({});
  const [specHot, setSpecHot] = createSignal<Record<NodeId, boolean>>({} as Record<NodeId, boolean>);
  let prevRC = { ...rc };
  let prevW: Record<string, number> = { innovation: w.innovation, governance: w.governance, sustainability: w.sustainability };
  let firstCommitPass = true;
  // Reading every memo here pulls any dirty one (running its fn -> bumping rc),
  // then we diff the ledger against the previous snapshot: a node is "hot" iff
  // its compute fn genuinely ran this round. Inputs are hot iff their value
  // actually changed. The very first pass (mount/SSR) seeds, it does not flash.
  createEffect(() => {
    const cw: Record<string, number> = { innovation: w.innovation, governance: w.governance, sustainability: w.sustainability };
    void scores(); void ranking(); void maxScore(); void leaderMemo(); void franceRankMemo();
    untrack(() => {
      const nh = {} as Record<NodeId, boolean>;
      for (const id of NODE_IDS) nh[id] = rc[id] > prevRC[id];
      const nw: Record<string, boolean> = {};
      for (const p of PILLARS) nw[p] = cw[p] !== prevW[p];
      prevRC = { ...rc };
      prevW = cw;
      setCounts({ ...rc });
      if (firstCommitPass) firstCommitPass = false;
      else { setHot(nh); setHotW(nw); }
    });
  });

  // The same diff for speculation: reading `predicted()` runs speculatePlan in a
  // shadow, bumping sc for whatever the exposed contract recomputes there. Only
  // active in you-drive mode; the leaf `maxScore` is not exposed, so it stays
  // dark under speculate - that is real, not hidden.
  let prevSC = { ...sc };
  createEffect(() => {
    if (mode() !== "you") { setSpecHot({} as Record<NodeId, boolean>); prevSC = { ...sc }; return; }
    void predicted(); void predMax();
    untrack(() => {
      const sh = {} as Record<NodeId, boolean>;
      for (const id of NODE_IDS) sh[id] = sc[id] > prevSC[id];
      prevSC = { ...sc };
      setSpecHot(sh);
    });
  });

  function fmtExplain(c: CauseRecord): string {
    if (c.action === "plan") {
      const steps = (c.args as Array<[string, ...unknown[]]>).map(([n, ...a]) => `${n}(${a.join(", ")})`);
      return steps.join("; ");
    }
    return `${c.action}(${(c.args as unknown[]).join(", ")})`;
  }

  function commitDraft() {
    const p = draftPillar();
    const wt = draftWeight();
    bridge.commitPlan([["setWeight", p, wt]]);
    setExplain(bridge.explain());
    setFlash(goalMet() ? "ok" : "none");
  }
  function resetYou() {
    reset();
    setDraftPillar("sustainability");
    setDraftWeight(1);
    setExplain(null);
    setFlash("none");
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
      setShadow({ label: `${p} = ${g}  ->  France #${fr.rank}`, ok });
      if (ok && !answer) answer = [p, g];
      await wait(300);
    }
    setShadow(null);
    if (answer) {
      addLog(`commit("setWeight", ${answer[0]}, ${answer[1]})`, "ok");
      bridge.call("setWeight", answer[0], answer[1]); setWrites(1); setFlash("ok");
      setExplain(bridge.explain());
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
      addLog(`setWeight(${p}, ${g})  ->  France #${goalRank()}`, ok ? "ok" : "wrong");
      if (ok) { answer = [p, g]; setFlash("ok"); setExplain(bridge.explain()); await wait(420); break; }
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
        setShadow({ label: `config -> France #${fr?.rank ?? "-"} - live untouched`, ok: !!fr && fr.rank <= 2 });
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
        setExplain(bridge.explain());
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
      setNote("Live AI needs the key-holding relay, which isn't wired on this deploy yet - see relay/README in the repo. Meanwhile the you-drive, pimas and ordinary agents above run with zero setup.");
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

  function rankRow(r: Row, max: number, tone: "live" | "pred"): Child {
    const isGoal = r.name === GOAL_UNIT, isTop = r.rank === 1;
    const barColor = tone === "pred"
      ? (isGoal ? "var(--ocean)" : "var(--granite)")
      : (isGoal ? "var(--ocean)" : isTop ? "var(--laurel)" : "var(--granite)");
    const pct = Math.round((r.score / max) * 100);
    return (
      <div style="display:flex; align-items:center; gap:12px; padding:6px 0;">
        <span style={`${mono} font-size:12px; width:20px; color:${isTop ? "var(--ink)" : "var(--granite)"}; font-weight:${isTop ? "700" : "400"};`}>#{String(r.rank)}</span>
        <span style={`font-family:var(--sans); font-size:14px; width:74px; color:var(--ink); font-weight:${isGoal ? "600" : "400"};`}>{r.name}</span>
        <span style="flex:1; height:10px; background:var(--surface); border-radius:2px; overflow:hidden;"><span style={`display:block; height:100%; width:${pct}%; background:${barColor}; transition:width .28s ease;`} /></span>
        <span style={`${mono} font-size:11px; width:40px; text-align:right; color:var(--granite); font-variant-numeric:tabular-nums;`}>{String(Math.round(r.score))}</span>
      </div>
    );
  }

  const pillarBtn = (p: string) => (
    <button type="button" onClick={() => { setDraftPillar(p); setDraftWeight(w[p]); }}
      style={() => `${mono} font-size:11px; padding:6px 10px; border-radius:2px; cursor:pointer; ` +
        (draftPillar() === p ? "background:var(--ocean); color:var(--ground); border:1px solid var(--ocean);" : "background:transparent; color:var(--granite); border:1px solid var(--line);")}>
      {p}
    </button>
  );

  // ── dependency-graph viz: nodes = the signals/memos of THIS model, edges =
  // derives-from, laid out in tiers left-to-right. The topology is hand-authored
  // to match this one model (it is NOT auto-discovered); the highlighting is not
  // - it comes straight from the real recompute ledgers above. ──
  const NW = 132, NH = 38;
  interface GNode { id: string; label: string; x: number; y: number; input: boolean; }
  const G_NODES: GNode[] = [
    { id: "innovation", label: "innovation", x: 4, y: 8, input: true },
    { id: "governance", label: "governance", x: 4, y: 66, input: true },
    { id: "sustainability", label: "sustainability", x: 4, y: 124, input: true },
    { id: "scores", label: "scores", x: 198, y: 66, input: false },
    { id: "ranking", label: "ranking", x: 392, y: 66, input: false },
    { id: "maxScore", label: "maxScore", x: 586, y: 8, input: false },
    { id: "leader", label: "leader", x: 586, y: 66, input: false },
    { id: "franceRank", label: "franceRank", x: 586, y: 124, input: false },
  ];
  const G_EDGES: Array<[string, string]> = [
    ["innovation", "scores"], ["governance", "scores"], ["sustainability", "scores"],
    ["scores", "ranking"], ["ranking", "maxScore"], ["ranking", "leader"], ["ranking", "franceRank"],
  ];
  const gById = (id: string) => G_NODES.find((n) => n.id === id)!;
  // In you-drive mode with a pending (uncommitted) draft, the speculate overlay is live.
  const specMode = () => mode() === "you" && dirty();
  type Lit = "spec" | "comm" | "none";
  const nodeLit = (n: GNode): Lit => {
    if (n.input) {
      if (specMode() && draftPillar() === n.id) return "spec";
      return hotW()[n.id] ? "comm" : "none";
    }
    if (specMode() && specHot()[n.id as NodeId]) return "spec";
    return hot()[n.id as NodeId] ? "comm" : "none";
  };
  const edgeLit = (from: string, to: string): Lit => {
    if (to === "scores") {
      if (specMode() && draftPillar() === from) return "spec";
      return hotW()[from] ? "comm" : "none";
    }
    if (specMode() && specHot()[to as NodeId]) return "spec";
    return hot()[to as NodeId] ? "comm" : "none";
  };
  const litStroke = (s: Lit) => (s === "spec" ? "var(--ocean)" : s === "comm" ? "var(--laurel)" : "var(--line)");

  const graph = () => (
    <div style="margin-top:20px;">
      <div style={`${mono} font-size:11px; letter-spacing:.14em; text-transform:uppercase; color:var(--granite); margin-bottom:8px;`}>dependency graph &middot; this model</div>
      <div style="overflow-x:auto; border:1px solid var(--line); border-radius:3px; background:var(--surface); padding:14px;">
        <svg viewBox="0 0 726 170" style="display:block; width:100%; min-width:660px; height:auto;" role="img" aria-label="dependency graph of the demo model">
          {G_EDGES.map(([from, to]) => {
            const a = gById(from), b = gById(to);
            const x1 = a.x + NW, y1 = a.y + NH / 2, x2 = b.x, y2 = b.y + NH / 2;
            return (
              <line x1={String(x1)} y1={String(y1)} x2={String(x2)} y2={String(y2)}
                style={() => { const s = edgeLit(from, to); return `stroke:${litStroke(s)}; stroke-width:${s === "none" ? "1" : "1.8"}px; ${s === "spec" ? "stroke-dasharray:5 3;" : ""}`; }} />
            );
          })}
          {G_NODES.map((n) => (
            <g>
              <rect x={String(n.x)} y={String(n.y)} width={String(NW)} height={String(NH)} rx="3"
                style={() => { const s = nodeLit(n); return `fill:var(--ground); stroke:${litStroke(s)}; stroke-width:${s === "none" ? "1" : "2"}px; ${s === "spec" ? "stroke-dasharray:5 3;" : ""}`; }} />
              <text x={String(n.x + NW / 2)} y={String(n.y + 16)} text-anchor="middle"
                style={() => { const s = nodeLit(n); return `font-family:var(--mono); font-size:11px; fill:${s === "spec" ? "var(--ocean)" : s === "comm" ? "var(--laurel)" : "var(--ink)"};`; }}>{n.label}</text>
              <text x={String(n.x + NW / 2)} y={String(n.y + 30)} text-anchor="middle"
                style={() => { const s = nodeLit(n); return `font-family:var(--mono); font-size:9px; fill:${s === "none" ? "var(--granite)" : s === "spec" ? "var(--ocean)" : "var(--laurel)"};`; }}>
                {n.input ? (() => `w ${w[n.id].toFixed(1)}`) : (() => `runs ${counts()[n.id as NodeId]}`)}
              </text>
            </g>
          ))}
        </svg>
      </div>
      <p style="font-family:var(--sans); font-size:12px; line-height:1.55; color:var(--granite); margin:8px 0 0; max-width:70ch;">
        This is the dependency graph for this one demo model, hand-wired to match it (not auto-discovered); a node lights <span style="color:var(--laurel);">laurel</span> only when its compute function genuinely re-ran on the last commit (the count is that node&rsquo;s real recompute total), and lights <span style="color:var(--ocean);">ocean, dashed</span> when the current speculate touched it in a shadow with nothing committed.
      </p>
    </div>
  );

  return (
    <div style="border:1px solid var(--line); border-radius:4px; background:var(--ground); padding:22px;">
      <div style="display:flex; align-items:baseline; justify-content:space-between; flex-wrap:wrap; gap:12px; margin-bottom:6px;">
        <div style={`${mono} font-size:11px; letter-spacing:.14em; text-transform:uppercase; color:var(--granite);`}>Live demo - drive it, or watch an agent</div>
        <div style="display:flex; gap:7px; flex-wrap:wrap;">{modeBtn("you", "you drive")}{modeBtn("pimas", "pimas agent")}{modeBtn("ordinary", "ordinary agent")}{LIVE_ENABLED ? modeBtn("live", "live AI") : null}</div>
      </div>
      <p style="font-family:var(--sans); font-size:14px; line-height:1.55; color:var(--granite); margin:0 0 16px; max-width:64ch;">
        {() => mode() === "you"
          ? "You are the agent. Pick a pillar, drag its weight, and watch the predicted ranking move through a real speculate - while the committed model on the left does not. Commit to apply it for real."
          : mode() === "live"
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

      {/* you-drive lever */}
      {() => mode() === "you" ? (
        <div style="border:1px solid var(--line); border-radius:3px; background:var(--surface); padding:14px 16px; margin-bottom:16px;">
          <div style="display:flex; align-items:baseline; gap:10px; flex-wrap:wrap; margin-bottom:10px;">
            <span style={`${mono} font-size:10px; letter-spacing:.12em; text-transform:uppercase; color:var(--granite);`}>weight of</span>
            <div style="display:flex; gap:6px;">{PILLARS.map((p) => pillarBtn(p))}</div>
          </div>
          <div style="display:flex; align-items:center; gap:14px;">
            <input type="range" min="0.5" max="16" step="0.5" value={() => String(draftWeight())}
              onInput={(e: Event) => setDraftWeight(Number((e.currentTarget as HTMLInputElement).value))}
              style="flex:1; accent-color:var(--ocean);" />
            <span style={`${mono} font-size:15px; font-weight:700; color:var(--ocean); width:56px; text-align:right; font-variant-numeric:tabular-nums;`}>{() => draftWeight().toFixed(1)}&times;</span>
          </div>
        </div>
      ) : null}

      <div style="display:flex; gap:18px; align-items:stretch; flex-wrap:wrap;">
        {/* live model */}
        <div style={() => "flex:1 1 300px; border-radius:3px; padding:16px; transition:background .2s, border-color .2s; border:1.5px solid " +
          (flash() === "wrong" ? "var(--falu); background:rgba(128,24,24,.06);" : flash() === "ok" ? "var(--laurel); background:rgba(59,91,71,.07);" : "var(--line); background:var(--ground);")}>
          <div style={`${mono} font-size:10px; letter-spacing:.12em; text-transform:uppercase; color:var(--granite); margin-bottom:10px;`}>
            {() => mode() === "you" ? "live model · committed" : "live model"} {() => (flash() === "ok" ? "· goal met" : flash() === "wrong" ? "· wrong state" : "")}
          </div>
          {() => ranking().map((r) => rankRow(r, maxScore(), "live"))}
        </div>

        {/* right column: predicted (you) or agent side (scripted/live) */}
        {() => mode() === "you" ? (
          <div style="flex:1 1 300px; display:flex; flex-direction:column; gap:13px;">
            <div style={() => "flex:1; border-radius:3px; padding:16px; border:1.5px dashed " +
              (dirty() ? "var(--ocean); background:rgba(59,86,105,.06);" : "var(--line);")}>
              <div style={`${mono} font-size:10px; letter-spacing:.12em; text-transform:uppercase; color:var(--ocean); margin-bottom:10px;`}>
                predicted · speculate, nothing committed {() => (predGoalRank() <= 2 ? "· goal met" : "")}
              </div>
              {() => predicted().map((r) => rankRow({ name: r.unit, score: r.score, rank: r.rank }, predMax(), "pred"))}
            </div>
            <div style="display:flex; gap:10px;">
              <button type="button" onClick={commitDraft} disabled={() => !dirty()}
                style={() => `${mono} font-size:13px; padding:11px 18px; border-radius:2px; flex:1; border:1px solid var(--laurel); ` +
                  (dirty() ? "background:var(--laurel); color:var(--ground); cursor:pointer;" : "background:var(--surface); border-color:var(--line); color:var(--granite); cursor:default;")}>
                {() => dirty() ? "commit this for real →" : "drag to speculate"}
              </button>
              <button type="button" onClick={resetYou}
                style={`${mono} font-size:13px; padding:11px 16px; border-radius:2px; border:1px solid var(--line); background:transparent; color:var(--granite); cursor:pointer;`}>
                reset
              </button>
            </div>
          </div>
        ) : (
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
        )}
      </div>

      {/* the model's dependency graph, lit from real recompute counts */}
      {graph()}

      {/* note / result line */}
      {() => note() ? <p style="font-family:var(--sans); font-size:13px; line-height:1.55; color:var(--ink); margin:14px 0 0; padding:11px 13px; background:var(--surface); border-radius:3px; border-left:2px solid var(--ocean);">{note()}</p> : null}

      {/* L2: the real explain() trace of the last commit */}
      {() => { const c = explain(); return c ? (
        <div style="margin:14px 0 0; padding:11px 13px; background:var(--surface); border-radius:3px; border-left:2px solid var(--laurel);">
          <span style={`${mono} font-size:9px; letter-spacing:.14em; text-transform:uppercase; color:var(--laurel);`}>explain() &middot; L2 causal record</span>
          <div style={`${mono} font-size:12.5px; line-height:1.55; color:var(--ink); margin-top:4px; word-break:break-word;`}>
            {fmtExplain(c)} <span style="color:var(--granite);">changed exposed</span> {c.changed.length ? c.changed.join(", ") : "nothing"}
            {c.writes.length ? <span style="color:var(--granite);"> &middot; wrote {c.writes.join(", ")}</span> : null}
          </div>
        </div>
      ) : null; }}

      {/* L1 + descriptor: the same bridge as a machine-readable artifact */}
      <div style="display:grid; grid-template-columns:repeat(auto-fit,minmax(240px,1fr)); gap:14px; margin-top:16px;">
        {/* descriptor() - the machine-readable contract */}
        <div style="border:1px solid var(--line); border-radius:3px; background:var(--surface); padding:12px 14px;">
          <div style={`${mono} font-size:9px; letter-spacing:.14em; text-transform:uppercase; color:var(--granite); margin-bottom:8px;`}>descriptor() &middot; machine-readable model of this page</div>
          {Object.entries(descriptor.state).map(([name, s]) => (
            <div style={`${mono} font-size:11.5px; line-height:1.5; margin-bottom:3px; word-break:break-word;`}>
              <span style="color:var(--ocean);">{name}</span>
              <span style="color:var(--granite);"> : {(s.schema as { type?: string } | undefined)?.type ?? "value"}</span>
              {s.description ? <span style="color:var(--granite);"> &middot; {s.description}</span> : null}
            </div>
          ))}
          {Object.entries(descriptor.actions).map(([name, a]) => (
            <div style={`${mono} font-size:11.5px; line-height:1.5; margin-bottom:3px; word-break:break-word;`}>
              <span style="color:var(--falu);">{name}({(a.params ?? []).join(", ")})</span>
              {a.description ? <span style="color:var(--granite);"> &middot; {a.description}</span> : null}
            </div>
          ))}
        </div>
        {/* subscribe() - the live L1 delta stream */}
        <div style="border:1px solid var(--line); border-radius:3px; background:var(--surface); padding:12px 14px;">
          <div style={`${mono} font-size:9px; letter-spacing:.14em; text-transform:uppercase; color:var(--granite); margin-bottom:8px;`}>subscribe() &middot; live delta stream</div>
          {() => deltas().length === 0
            ? <div style={`${mono} font-size:11.5px; color:var(--granite);`}>commit a change to see deltas pushed here</div>
            : deltas().map((d) => (
              <div style={`${mono} font-size:11.5px; line-height:1.5; margin-bottom:3px; word-break:break-word; color:${d.tone === "cause" ? "var(--falu)" : "var(--ink)"};`}>
                <span style="color:var(--granite);">{d.tone === "cause" ? "cause " : "state "}</span>{d.t}
              </div>
            ))}
        </div>
      </div>

      <p style="font-family:var(--sans); font-size:12px; line-height:1.55; color:var(--granite); margin:14px 0 0;">
        {() => mode() === "you"
          ? "The predicted panel is bridge.speculatePlan run in a copy-on-write shadow in your browser; the live panel is the committed graph, untouched until you commit. Commit calls commitPlan; the explain() trace and the subscribe() stream above are the real bridge output, not a recording."
          : mode() === "live"
          ? "The model runs remotely through a key-holding relay; its tools execute here against the real pimas graph - the speculation never leaves your browser."
          : "This runs pimas in your browser - the same speculate the framework ships. The scripted policy is fixed; the shadow evaluation is real (nothing commits until the final commit)."}
      </p>
    </div>
  );
}
