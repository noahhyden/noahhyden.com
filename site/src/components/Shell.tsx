import type { Child } from "pimas-ui/dom";
import { AzulejoDefs, AzulejoField } from "./Azulejo.js";
import { Nav } from "./Nav.js";
import { Footer } from "./Footer.js";

type Section = "pimas" | null;

/** One page-wide tracery field sits behind everything; content rides above it on z-index 1 and carries its own radial scrims. */
export function Shell(props: { active?: Section; pattern?: "quatrefoil" | "rosette"; children?: Child }) {
  return (
    <div>
      <AzulejoDefs />
      <AzulejoField pattern={props.pattern ?? "quatrefoil"} />
      <div style="position:relative; z-index:1;">
        <Nav active={props.active ?? null} />
        {props.children}
        <Footer />
      </div>
    </div>
  );
}
