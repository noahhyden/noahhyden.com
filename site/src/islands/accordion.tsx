/**
 * The site's first interactive ISLAND - an accordion, built with pimas.
 *
 * This module is PURE: it only default-exports a component and imports the
 * headless core (`pimas`) + control flow (`pimas/flow`). No DOM code, no
 * side effects at import - so the SSR build imports it to bake the collapsed
 * markup (0 KB JS), and the client build bundles it to be lazy-mounted live by
 * the island boot script. The whole point: proof that fine-grained interactivity
 * works, shipped only on the page that uses it.
 */
import { createSignal } from "pimas-ui";
import { For } from "pimas-ui/flow";
import type { Child } from "pimas-ui/dom";

const ITEMS: Array<{ q: string; a: string }> = [
  {
    q: "Is this page running a framework?",
    a: "Only this box is. The rest of the site is static HTML with zero JavaScript - this accordion is a single lazy-loaded island, mounted live by pimas when it scrolls into view.",
  },
  {
    q: "What does “fine-grained” buy me here?",
    a: "Opening a panel writes one signal. Only the two nodes that read it - this row's “+/–” glyph and its panel height - re-run. There is no virtual DOM and no diff pass, so nothing else on the page is touched.",
  },
  {
    q: "Why build the framework at all?",
    a: "To own the whole stack end to end - the same reason this site dropped Claude's design-canvas runtime. pimas renders this island in the browser and prerenders every other page to static HTML from the exact same component code.",
  },
];

export default function Accordion(): Child {
  // Index of the open panel; -1 = all closed. One signal drives the whole widget.
  const [open, setOpen] = createSignal(0);

  return (
    <div
      style="border:1px solid var(--line); border-radius:4px; overflow:hidden; background:var(--surface);"
      role="presentation"
    >
      <For each={ITEMS}>
        {(item, i) => {
          const isOpen = () => open() === i();
          return (
            <div style="border-top:1px solid var(--line);">
              <button
                type="button"
                onClick={() => setOpen(isOpen() ? -1 : i())}
                style="width:100%; display:flex; align-items:center; justify-content:space-between; gap:16px; padding:16px 20px; background:none; border:none; cursor:pointer; text-align:left; font-family:var(--serif); font-weight:600; font-size:16px; color:var(--ink);"
              >
                <span>{item.q}</span>
                <span
                  style={() =>
                    `flex:0 0 auto; font-family:var(--mono); font-size:18px; line-height:1; color:var(--falu); transition:transform .2s ease; transform:rotate(${isOpen() ? "45deg" : "0deg"});`
                  }
                >
                  +
                </span>
              </button>
              <div
                style={() =>
                  `overflow:hidden; transition:max-height .28s ease; max-height:${isOpen() ? "220px" : "0"};`
                }
              >
                <p style="margin:0; padding:0 20px 18px; font-family:var(--sans); font-size:14px; line-height:1.6; color:var(--granite);">
                  {item.a}
                </p>
              </div>
            </div>
          );
        }}
      </For>
    </div>
  );
}
