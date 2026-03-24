export type CitationVariant = 'inline' | 'footnote'

export type CitationItem = {
  id: string
  [key: string]: unknown
}

export type SlideCitationState = {
  usedIds: string[]
  footnoteIds: string[]
}
