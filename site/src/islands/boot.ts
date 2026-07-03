/**
 * Island boot - the ONLY client entry, and the only JavaScript any page ships.
 *
 * It walks the `<is-land>` markers the SSR build emitted, and for each one:
 *   1. schedules by its `data-client` strategy (load / idle / visible),
 *   2. dynamically imports the island's component bundle,
 *   3. CLAIMS it - adopts the server markup in place (reuses the nodes, wires
 *      reactivity + listeners onto them) instead of discarding and re-rendering.
 *      Falls back to a client render on any structural desync (pimas claim, #6).
 *
 * esbuild code-splitting factors the pimas kernel into one shared chunk, so boot
 * and every island share a SINGLE kernel instance (no dual-kernel hazard, #26).
 */
import { claim } from "pimas-ui/hydrate";

type IslandModule = { default: (props: unknown) => unknown };

function mountInto(el: HTMLElement): void {
  const src = `/islands/${el.dataset.island}.js`;
  const props = el.dataset.props ? JSON.parse(el.dataset.props) : {};
  import(src).then((mod: IslandModule) => {
    claim(() => mod.default(props) as never, el);
  });
}

function schedule(el: HTMLElement): void {
  const strategy = el.dataset.client || "idle";
  if (strategy === "load") {
    mountInto(el);
  } else if (strategy === "visible" && "IntersectionObserver" in window) {
    const io = new IntersectionObserver((entries, obs) => {
      if (entries[0]!.isIntersecting) {
        obs.disconnect();
        mountInto(el);
      }
    });
    io.observe(el);
  } else if ("requestIdleCallback" in window) {
    (window as unknown as { requestIdleCallback(cb: () => void): void }).requestIdleCallback(() =>
      mountInto(el),
    );
  } else {
    setTimeout(() => mountInto(el), 200);
  }
}

for (const el of document.querySelectorAll<HTMLElement>("is-land[data-island]")) {
  schedule(el);
}
