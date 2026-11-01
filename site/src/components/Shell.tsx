import type { Child } from "pimas-ui/dom";
import { AzulejoDefs } from "./Azulejo.js";
import { Nav } from "./Nav.js";
import { Footer } from "./Footer.js";

type Section = "pimas" | null;

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
