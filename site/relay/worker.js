/**
 * Production LLM relay — Cloudflare Worker. Holds the Gemini key as an encrypted
 * secret; the static site posts {contents, tools} and this forwards to Gemini
 * generateContent (non-streaming — the agent loop needs whole functionCalls),
 * returning the JSON. Defends the key: origin allowlist + per-IP burst limit +
 * hard per-IP daily cap + a global daily budget kill-switch + capped output.
 *
 * Deploy (see relay/README.md):
 *   wrangler kv namespace create CAP        # paste id into wrangler.jsonc
 *   wrangler secret put GEMINI_KEY
 *   wrangler deploy
 */
const ALLOWED = new Set(["https://noahhyden.com", "https://www.noahhyden.com"]);
const MODEL = "gemini-2.5-flash";
const PER_IP_DAILY = 40; // runs are ~10 calls; ~4 runs/IP/day
const GLOBAL_DAILY = 3000; // hard ceiling across everyone — bounds worst-case spend

const cors = (o) => ({
  "Access-Control-Allow-Origin": ALLOWED.has(o) ? o : "null",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
  Vary: "Origin",
});

export default {
  async fetch(req, env) {
    const origin = req.headers.get("Origin") || "";
    const h = cors(origin);
    if (req.method === "OPTIONS") return new Response(null, { headers: h });
    if (req.method !== "POST" || !ALLOWED.has(origin)) return new Response("Forbidden", { status: 403, headers: h });

    const ip = req.headers.get("CF-Connecting-IP") || "0.0.0.0";
    if (env.RL) {
      const { success } = await env.RL.limit({ key: ip }); // native token bucket (see wrangler.jsonc)
      if (!success) return json({ error: "Rate limited — slow down a moment." }, 429, h);
    }
    const day = new Date().toISOString().slice(0, 10);
    const ipKey = `ip:${ip}:${day}`;
    const gKey = `all:${day}`;
    const ipUsed = +((await env.CAP.get(ipKey)) || 0);
    const gUsed = +((await env.CAP.get(gKey)) || 0);
    if (ipUsed >= PER_IP_DAILY) return json({ error: "Daily limit reached for your connection — try the scripted agents." }, 429, h);
    if (gUsed >= GLOBAL_DAILY) return json({ error: "The live demo is resting for today — try the scripted agents." }, 503, h);
    await env.CAP.put(ipKey, String(ipUsed + 1), { expirationTtl: 86400 });
    await env.CAP.put(gKey, String(gUsed + 1), { expirationTtl: 86400 });

    let payload;
    try { payload = await req.json(); } catch { return json({ error: "bad request" }, 400, h); }

    const upstream = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${env.GEMINI_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: payload.contents,
          tools: payload.tools,
          toolConfig: { functionCallingConfig: { mode: "AUTO" } },
          generationConfig: { temperature: 0, maxOutputTokens: 1024, thinkingConfig: { thinkingBudget: 0 } },
        }),
      },
    );
    return new Response(await upstream.text(), { status: upstream.status, headers: { ...h, "Content-Type": "application/json" } });
  },
};

const json = (obj, status, h) => new Response(JSON.stringify(obj), { status, headers: { ...h, "Content-Type": "application/json" } });
