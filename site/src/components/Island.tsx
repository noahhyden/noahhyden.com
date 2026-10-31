/** SSR island marker; keep `slug` in sync with ISLANDS in build.mjs. */
import type { Child } from "pimas-ui/dom";

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
