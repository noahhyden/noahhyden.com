/**
 * The page shell: the themed outer container, the azulejo pattern definition
 * (once per document), the nav, and the footer. Pages supply only their own
 * content and which nav item is active.
 */
import type { Child } from "pimas-ui/dom";
import { AzulejoDefs } from "./Azulejo.js";
import { Nav } from "./Nav.js";
import { Footer } from "./Footer.js";

type Section = "about" | "projects" | "papers" | "writing" | null;

export function Shell(props: { active?: Section; children?: Child }) {
  return (
    <div>
      <AzulejoDefs />
      <Nav active={props.active ?? null} />
      {props.children}
      <Footer />
    </div>
  );
}
