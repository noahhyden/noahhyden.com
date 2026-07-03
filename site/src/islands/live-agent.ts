/**
 * A tiny browser-side LLM agent loop. The model's "brain" is remote - reached
 * through a thin relay that holds the API key (`proxyUrl`) - but its "hands" (the
 * tools) run RIGHT HERE, against the live pimas graph. The LLM only chooses
 * function calls; `LiveTool.run` executes them client-side, so the real
 * speculate/commit never leaves the browser.
 *
 * Framework-agnostic: no pimas import. The island wires its bridge into `tools`.
 * Speaks the Gemini generateContent shape (the relay forwards it verbatim).
 */
export interface LiveTool {
  decl: { name: string; description: string; parameters: object };
  run: (args: Record<string, unknown>) => unknown;
}
export interface StepInfo { name: string; args: Record<string, unknown>; result: unknown; }
export interface LiveOpts {
  proxyUrl: string;
  system: string;
  tools: LiveTool[];
  onStep?: (s: StepInfo) => void;
  onText?: (t: string) => void;
  stepCap?: number;
}
export interface LiveResult { answer: Record<string, unknown> | null; steps: number; tokens: number; }

export async function runLiveAgent(o: LiveOpts): Promise<LiveResult> {
  const toolDecls = [{ function_declarations: o.tools.map((t) => t.decl) }];
  const byName = new Map(o.tools.map((t) => [t.decl.name, t]));
  const contents: any[] = [{ role: "user", parts: [{ text: o.system }] }];
  const cap = o.stepCap ?? 12;
  let tokens = 0;
  let answer: Record<string, unknown> | null = null;

  for (let i = 0; i < cap; i++) {
    const res = await fetch(o.proxyUrl, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ contents, tools: toolDecls }),
    });
    if (!res.ok) throw new Error(`relay ${res.status}: ${(await res.text()).slice(0, 160)}`);
    const data = await res.json();
    if (data.error) throw new Error(typeof data.error === "string" ? data.error : data.error.message || "relay error");
    tokens += data.usageMetadata?.totalTokenCount ?? 0;

    const parts: any[] = data.candidates?.[0]?.content?.parts ?? [];
    const calls = parts.filter((p) => p.functionCall);
    if (calls.length === 0) {
      o.onText?.(parts.map((p) => p.text ?? "").join(""));
      break;
    }
    contents.push({ role: "model", parts }); // echo model turn (incl. thoughtSignature)
    const responses: any[] = [];
    for (const { functionCall } of calls) {
      const name: string = functionCall.name;
      const args: Record<string, unknown> = functionCall.args ?? {};
      const tool = byName.get(name);
      let result: unknown;
      try { result = tool ? tool.run(args) : { error: `unknown tool ${name}` }; }
      catch (e) { result = { error: String((e as Error).message) }; }
      o.onStep?.({ name, args, result });
      responses.push({ functionResponse: { name, response: { result } } });
      if (name === "submit_answer") answer = args;
    }
    contents.push({ role: "user", parts: responses });
    if (answer) return { answer, steps: i + 1, tokens };
  }
  return { answer, steps: cap, tokens };
}
