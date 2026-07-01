/**
 * Two new pimas primitives, dogfooded live on the page — an island that exercises
 * `onMount` (from pimas/dom) and `<ErrorBoundary>` (from pimas/flow).
 *
 * Like the accordion, this module is PURE: it default-exports a component and
 * imports only headless pieces (pimas + pimas/flow) plus the DOM-side `onMount`
 * hook. No side effects at import, so SSR bakes the static markup (0 KB JS) and
 * the client build lazy-mounts it live.
 *
 *   • onMount + ref  — an <input> that autofocuses AFTER the nodes are inserted,
 *     proving onMount fires post-insertion (a bare effect would see a detached
 *     node and the focus would be lost).
 *   • ErrorBoundary  — a counter whose child THROWS during render once count ≥ 3.
 *     The boundary catches it and swaps to a fallback; reset() zeroes the count
 *     and rebuilds the working counter fresh.
 */
import { createSignal } from "pimas";
import { onMount } from "pimas/dom";
import { ErrorBoundary } from "pimas/flow";
import type { Child } from "pimas/dom";

const mono = "font-family:var(--mono);";
const label = `${mono} font-size:10px; letter-spacing:.12em; text-transform:uppercase; color:var(--granite); margin:0 0 12px;`;
const card =
  "border:1px solid var(--line); border-radius:3px; background:var(--ground); padding:22px;";

/** A tidy laurel button — the one interactive control shape used throughout. */
function Btn(props: { onClick: () => void; children: Child; tone?: "laurel" | "falu" }) {
  const bg = props.tone === "falu" ? "var(--falu)" : "var(--laurel)";
  return (
    <button
      type="button"
      onClick={props.onClick}
      style={`display:inline-flex; align-items:center; gap:9px; font-family:var(--sans); font-weight:500; font-size:14px; padding:9px 18px; border-radius:2px; background:${bg}; color:var(--ground); border:1px solid ${bg}; cursor:pointer;`}
    >
      {props.children}
    </button>
  );
}

/** onMount + ref autofocus: the input takes focus only once it's in the live tree. */
function AutofocusField(): Child {
  let el: HTMLInputElement | undefined;
  // Fires AFTER insertion — a plain effect would run against a detached node.
  onMount(() => el?.focus());
  return (
    <div>
      <div style={label}>onMount &middot; ref autofocus</div>
      <input
        ref={(n: HTMLInputElement) => (el = n)}
        placeholder="focused on mount"
        data-testid="autofocus-input"
        style="width:100%; box-sizing:border-box; font-family:var(--sans); font-size:15px; color:var(--ink); background:var(--ground); border:1px solid var(--granite); border-radius:2px; padding:10px 12px; outline:2px solid transparent; outline-offset:2px;"
        onFocus={(e: FocusEvent) =>
          ((e.currentTarget as HTMLInputElement).style.outlineColor = "var(--falu)")
        }
        onBlur={(e: FocusEvent) =>
          ((e.currentTarget as HTMLInputElement).style.outlineColor = "transparent")
        }
      />
      <p style="font-family:var(--sans); font-size:12px; line-height:1.55; color:var(--granite); margin:9px 0 0;">
        <span style="color:var(--ink);">onMount</span> ran after these nodes entered the DOM, so the field could take focus. An effect alone sees a detached node.
      </p>
    </div>
  );
}

/**
 * The crash-test child: reads the count signal and THROWS during render (inside a
 * render thunk) once count ≥ 3 — the pattern ErrorBoundary catches. A throw in an
 * event handler would NOT be caught, which is why the increment lives outside.
 */
function CrashCounter(props: { count: () => number; inc: () => void }): Child {
  const { count, inc } = props;
  return (
    <div>
      <div style={`display:flex; align-items:center; gap:16px; ${mono} font-size:13px; color:var(--ink); margin-bottom:14px;`}>
        <span>
          count ={" "}
          <span data-testid="count" style="color:var(--falu); font-size:18px;">
            {/* throw INSIDE a render thunk → caught by the boundary */}
            {() => (count() >= 3 ? (() => { throw new Error("boom at 3"); })() : String(count()))}
          </span>
        </span>
      </div>
      <Btn onClick={inc}>increment</Btn>
    </div>
  );
}

export default function PrimitivesDemo(): Child {
  const [count, setCount] = createSignal(0);
  const inc = () => setCount(count() + 1);

  return (
    <div style="display:grid; grid-template-columns:1fr 1fr; gap:20px; align-items:start;">
      <div style={card}>
        <AutofocusField />
      </div>

      <div style={card}>
        <div style={label}>ErrorBoundary &middot; crash &amp; reset</div>
        <ErrorBoundary
          fallback={(err, reset) => (
            <div data-testid="fallback">
              <div style={`display:flex; align-items:center; gap:9px; ${mono} font-size:13px; color:var(--falu); margin-bottom:12px;`}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="flex:none;">
                  <path d="M12 3 L22 20 L2 20 Z" />
                  <line x1="12" y1="10" x2="12" y2="14" />
                  <line x1="12" y1="17" x2="12" y2="17.5" />
                </svg>
                <span>caught: {String((err as Error)?.message ?? err)}</span>
              </div>
              <Btn
                tone="falu"
                onClick={() => {
                  setCount(0); // rebuild the counter fresh, back at zero
                  reset();
                }}
              >
                reset
              </Btn>
            </div>
          )}
        >
          {() => <CrashCounter count={count} inc={inc} />}
        </ErrorBoundary>
        <p style="font-family:var(--sans); font-size:12px; line-height:1.55; color:var(--granite); margin:14px 0 0;">
          Increment to <span style="color:var(--ink);">3</span> and the child throws <span style="font-style:italic;">during render</span>; the boundary swaps to this fallback. <span style="color:var(--ink);">reset</span> zeroes the count and rebuilds the live counter.
        </p>
      </div>
    </div>
  );
}
