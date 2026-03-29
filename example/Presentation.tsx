import { Deck, Slide } from "@revealjs/react";
import { Bibliography, Cite, CitationProvider, Sources } from "../src";
import references from "./references.json";

export default function Presentation() {
  return (
    <CitationProvider
      entries={references}
      style="apa"
      locale="de-DE"
      markerStyle="brackets"
      defaultInlineMode="parenthetical"
    >
      <Deck>
        <Slide>
          <h2>Transformer</h2>
          <p>
            Bekannt wurde die Architektur durch <Cite id="vaswani2017" />.
          </p>
          <p>
            Gruppierte Quellen funktionieren ebenfalls: <Cite id={["vaswani2017", "devlin2019"]} />.
          </p>
          <p>
            Narrativ: <Cite id="devlin2019" inline="narrative" />.
          </p>
          <p>
            Parenthetisch: <Cite id="devlin2019" inline="parenthetical" />.
          </p>
          <small>
            <Sources />
          </small>
        </Slide>

        <Slide>
          <h2>Literatur</h2>
          <Bibliography />
        </Slide>
      </Deck>
    </CitationProvider>
  );
}
