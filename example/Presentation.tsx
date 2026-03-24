'use client'

import { Deck, Slide } from '@revealjs/react'
import {
  Bibliography,
  Cite,
  CitationProvider,
  Sources,
} from '../src'
import references from './references.json'

export default function Presentation() {
  return (
    <CitationProvider entries={references} style="apa" locale="de-DE">
      <Deck>
        <Slide>
          <h2>Transformer</h2>
          <p>
            Bekannt wurde die Architektur durch <Cite id="vaswani2017" />.
          </p>
          <p>
            Im Fließtext steht dann <Cite id="devlin2019" inline />.
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
  )
}
