'use client'

import React from 'react'

import { formatBibliographyHtml } from '../lib/format'
import { useCitationStore } from '../store/provider'
import type { CitationItem } from '../types'

export type BibliographyProps = {
  ids?: string[]
  className?: string
  as?: React.ElementType
}

export function Bibliography({ ids, className, as: Component = 'div' }: BibliographyProps) {
  const entriesById = useCitationStore((state) => state.entriesById)
  const orderedUsedIds = useCitationStore((state) => state.orderedUsedIds)
  const style = useCitationStore((state) => state.style)
  const locale = useCitationStore((state) => state.locale)

  const resolvedIds = ids ?? orderedUsedIds

  const items = resolvedIds
    .map((id) => entriesById[id])
    .filter((item): item is CitationItem => Boolean(item))

  if (items.length === 0) {
    return <Component className={className} />
  }

  const html = formatBibliographyHtml(items, style, locale)

  return <Component className={className} dangerouslySetInnerHTML={{ __html: html }} />
}
