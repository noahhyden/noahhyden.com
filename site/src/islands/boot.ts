/** Island boot: the only client entry; schedules, imports and claims each `<is-land>` (shared kernel chunk, no dual kernel). */
import { claim } from "pimas-ui/hydrate";

type IslandModule = { default: () => unknown };

function mountInto(el: HTMLElement): void {
  const src = `/islands/${el.dataset.island}.js`;
  import(src).then((mod: IslandModule) => {
    claim(() => mod.default() as never, el);
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
