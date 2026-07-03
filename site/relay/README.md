# Live-demo LLM relay

The `/pimas/` page has a **Live AI** mode: a real LLM agent drives the pimas model
in the browser. The model's tools execute client-side (real `speculate`/`commit`);
only the LLM *call* goes through this relay, which holds the API key. The static
GitHub Pages site never sees the key.

## Local (prove it now)

```sh
# reads the key from ~/.config/pimas-eval.key (or GEMINI_API_KEY)
node relay/dev-relay.mjs                 # → http://localhost:8790
```

Then on the served page, point the demo at it (once, in the browser console):

```js
window.__PIMAS_PROXY__ = "http://localhost:8790"
```

and pick **Live AI**. (The free AI Studio key is ~20 req/day — fine for a few runs.)

## Production (Cloudflare Workers)

The clean pattern: keep the site root on GitHub Pages (DNS-only), put the relay on
`api.noahhyden.com` via a Worker Custom Domain — the root is never touched.

```sh
npm i -g wrangler
wrangler kv namespace create CAP     # paste the printed id into wrangler.jsonc
wrangler secret put GEMINI_KEY       # paste a PAID Gemini key (free tier is 20/day)
wrangler deploy
```

Then wire the page to it — set the endpoint in `src/islands/agent-sim.tsx`
(`PROXY_URL` default) to `https://api.noahhyden.com`, rebuild, deploy. Live AI
lights up automatically.

**Defenses baked into `worker.js`:** origin allowlist (only noahhyden.com), a
native per-IP burst limiter, a hard per-IP daily cap, a global daily budget
kill-switch, and capped output tokens. If the key drains or the relay is down, the
page falls back to the always-on **scripted** agents — the demo never looks broken.

Swap to Anthropic (Claude Haiku 4.5) by changing the upstream URL/headers in
`worker.js` (`x-api-key` + `anthropic-version`) and the request/response shape.
