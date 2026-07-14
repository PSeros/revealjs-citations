'use client'

import { formatBibliographyEntries, type BibliographyEntry } from './format'
import { useCitationStore } from '../store/provider'
import type { CitationItem } from '../types'

export function useBibliographyEntries(ids?: string[]): BibliographyEntry[] {
  const entriesById = useCitationStore((state) => state.entriesById)
  const orderedUsedIds = useCitationStore((state) => state.orderedUsedIds)
  const style = useCitationStore((state) => state.style)
  const locale = useCitationStore((state) => state.locale)

  const resolvedIds = ids ?? orderedUsedIds

  const items = resolvedIds
    .map((id) => entriesById[id])
    .filter((item): item is CitationItem => Boolean(item))

  if (items.length === 0) return []

  return formatBibliographyEntries(items, style, locale)
}
