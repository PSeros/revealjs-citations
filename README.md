# revealjs-citations

A small React package for `@revealjs/react` that formats citations with `citation-js` and automatically collects them per slide.

## Features

- `<Cite id="..." />` for footnote markers by default
- `markerStyle="brackets" | "superscript"` on `<CitationProvider />`
- `<Cite id={["...", "..."]} />` for grouped markers like `[1, 2]`
- `<Cite id="..." inline="narrative" />` and `<Cite id="..." inline="parenthetical" />`
- `<Sources />` shows only the footnote sources for the current slide
- Footnote sources in short form, like inline citations but without parentheses
- `<Bibliography />` generates a global bibliography from all sources used in the deck
- `useBibliographyEntries()` returns the bibliography as an array so you can paginate or customize the layout yourself
- automatic slide assignment via the next surrounding `section`
- only one public wrapper: `<CitationProvider />`

## Installation

```bash
npm install revealjs-citations
```

## Expected data format

The package expects an array of CSL-JSON-like entries with a stable `id`.

```json
[
  {
    "id": "vaswani2017",
    "type": "paper-conference",
    "title": "Attention Is All You Need",
    "author": [{ "family": "Vaswani", "given": "Ashish" }],
    "issued": { "date-parts": [[2017]] }
  }
]
```

## Basic usage

```tsx
import { Deck, Slide } from "@revealjs/react";
import {
  Bibliography,
  Cite,
  CitationProvider,
  Sources,
} from "reveajs-citations";

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
            The architecture became well known through <Cite id="vaswani2017" /> -> [1]
            .
          </p>
          <p>
            You can also use <Cite id="vaswani2017" inline="parenthetical" /> -> (Vaswani et al. 2017)
            inline in the text.
          </p>
          <p>
            Or narrative citations: <Cite id="vaswani2017" inline="narrative" /> -> Vaswani et al.
            (2017).
          </p>
          <small>
            <Sources />
          </small>
        </Slide>

        <Slide>
          <h2>References</h2>
          <Bibliography />
        </Slide>
      </Deck>
    </CitationProvider>
  );
}
```

## API

### `CitationProvider`

```tsx
<CitationProvider
  entries={references}
  style="apa"
  locale="de-DE"
  markerStyle="brackets"
  defaultInlineMode="parenthetical"
>
  {children}
</CitationProvider>
```

Props:

- `entries`: array of citations with `id`
- `style`: CSL style, default `apa`
- `locale`: language/locale, default `de-DE`
- `markerStyle`: `"brackets" | "superscript"`, default `"brackets"`
- `defaultInlineMode`: fallback for `inline={true}`, default `"parenthetical"`

### `Cite`

```tsx
<Cite id="vaswani2017" />
<Cite id={["vaswani2017", "devlin2019"]} />
<Cite id="vaswani2017" inline="narrative" />
<Cite id="vaswani2017" inline="parenthetical" />
```

Props:

- `id: string | string[]`
- `inline?: boolean | "narrative" | "parenthetical"`
- `prefix?: string`
- `suffix?: string`
- `className?: string`

Behavior:

- Default is footnote mode and renders a global marker like `[1]`, `[2]`, ... according to the first use in the entire deck
- Multiple IDs are rendered as grouped markers like `[1, 2]`
- `inline="narrative"` renders `Vaswani et al. (2017)`
- `inline="parenthetical"` renders `(Vaswani et al. 2017)`
- `inline={true}` uses the provider default from `defaultInlineMode`

### `Sources`

```tsx
<Sources />
```

Shows only the footnote sources for the current slide, side by side instead of as a list. The markers remain global and do not reset per slide. The entries are rendered in short form, like inline citations without parentheses.

Props:

- `separator?: React.ReactNode` – default `·`
- `showMarkers?: boolean` – default `true`
- `className?: string`
- `as?: React.ElementType`

### `Bibliography`

```tsx
<Bibliography />
```

Displays a global bibliography from all sources cited in the deck.

Props:

- `ids?: string[]` – optionally define manually
- `className?: string`
- `as?: React.ElementType`

Renders every requested source into a single element. For large bibliographies
this can overflow a slide — use `useBibliographyEntries` below if you need to
split the bibliography across multiple slides.

### `useBibliographyEntries`

```tsx
import { Slide, Stack } from "@revealjs/react";
import { useBibliographyEntries } from "revealjs-citations";

function chunk<T>(arr: T[], size: number): T[][] {
  return Array.from({ length: Math.ceil(arr.length / size) }, (_, i) =>
    arr.slice(i * size, i * size + size)
  );
}

function ReferencesSlides() {
  const entries = useBibliographyEntries();
  const pages = chunk(entries, 5); // pick a size that fits your theme

  return (
    <Stack>
      {pages.map((page, i) => (
        <Slide key={i}>
          <h2>References{pages.length > 1 ? ` (${i + 1}/${pages.length})` : ""}</h2>
          {page.map((entry) => (
            <div key={entry.id} dangerouslySetInnerHTML={{ __html: entry.html }} />
          ))}
        </Slide>
      ))}
    </Stack>
  );
}
```

`useBibliographyEntries(ids?: string[]): { id: string; html: string }[]` returns
one formatted HTML fragment per source, in bibliography order. Entry numbers
for numeric CSL styles (e.g. `vancouver`) stay correct even when you split
entries across slides, since the whole bibliography is formatted once
internally before being split per entry. This hook renders nothing itself —
you decide how many entries go on a slide, how to group them, and how to
style them.

## Internal architecture

The store saves all used sources grouped by slide ID.

```ts
{
  bySlide: {
    'section:intro': {
      usedIds: ['vaswani2017', 'devlin2019'],
      footnoteIds: ['vaswani2017']
    }
  }
}
```

The slide ID is automatically determined via the next surrounding `section`.

## Notes

- For the default footnote mode, `Sources` should be rendered on the same slide.
- If a Reveal slide already has an HTML `id`, that will be preferred.
