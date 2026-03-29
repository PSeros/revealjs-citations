export type CitationVariant = 'inline' | 'footnote'
export type CitationMarkerStyle = 'brackets' | 'superscript'
export type CitationInlineMode = 'narrative' | 'parenthetical'

export type CitationItem = {
  id: string
  [key: string]: unknown
}

export type SlideCitationState = {
  usedIds: string[]
  footnoteIds: string[]
}
