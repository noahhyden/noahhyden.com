/** Local dev relay: forwards {contents, tools} to Gemini with the key held server-side; prod is relay/worker.js. */
import { createServer } from "node:http";
import { readFileSync } from "node:fs";

const KEY = process.env.GEMINI_API_KEY ?? readFileSync(`${process.env.HOME}/.config/pimas-eval.key`, "utf8").trim();
const MODEL = process.env.GEMINI_MODEL ?? "gemini-2.5-flash";
const PORT = Number(process.env.PORT ?? 8790);
const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "content-type",
};

createServer(async (req, res) => {
  if (req.method === "OPTIONS") { res.writeHead(204, CORS); res.end(); return; }
  if (req.method !== "POST") { res.writeHead(405, CORS); res.end(); return; }
  let body = "";
  for await (const c of req) body += c;
  try {
    const { contents, tools } = JSON.parse(body);
    const r = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${KEY}`,
      {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          contents,
          tools,
          // 2.5-pro can't disable thinking (min 128); flash/lite take 0.
          generationConfig: MODEL.includes("pro")
            ? { temperature: 0, maxOutputTokens: 4096, thinkingConfig: { thinkingBudget: 128 } }
            : { temperature: 0, maxOutputTokens: 1024, thinkingConfig: { thinkingBudget: 0 } },
        }),
      },
    );
    const text = await r.text();
    res.writeHead(r.status, { ...CORS, "content-type": "application/json" });
    res.end(text);
  } catch (e) {
    res.writeHead(500, { ...CORS, "content-type": "application/json" });
    res.end(JSON.stringify({ error: String(e?.message ?? e) }));
  }
}).listen(PORT, () => console.log(`dev relay → gemini (${MODEL}) on http://localhost:${PORT}`));
