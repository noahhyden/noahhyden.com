/**
 * The SSR-side island marker. Renders the island's component INLINE (so the page
 * ships real, styled, static HTML — 0 KB JS if the JS never loads) wrapped in an
 * `<is-land>` element carrying the client contract the boot script reads:
 *   data-island → which bundle to lazy-load (/islands/<slug>.js)
 *   data-client → the load strategy (load | idle | visible)
 *   data-props  → JSON props handed to the client component (optional)
 *
 * The build discovers islands by their slug (see build.mjs ISLANDS) and emits
 * one client bundle per slug. Keep `slug` in sync with that list.
 */
import type { Child } from "pimas/dom";

export function Island(props: {
  slug: string;
  component: () => Child;
  client?: "load" | "idle" | "visible";
  props?: Record<string, unknown>;
}): Child {
  return (
    <is-land
      data-island={props.slug}
      data-client={props.client ?? "idle"}
      data-props={props.props ? JSON.stringify(props.props) : undefined}
      style="display:block;"
    >
      {props.component()}
    </is-land>
  );
}
