'use client'

import React from 'react'

import { formatBibliographyHtml, formatBibliographyHtmlChunks } from '../lib/format'
import { useCitationStore } from '../store/provider'
import type { CitationItem } from '../types'

const DEFAULT_ITEMS_PER_SLIDE = 8

export type BibliographyProps = {
  ids?: string[]
  className?: string
  as?: React.ElementType
  itemsPerSlide?: number | false
}

export function Bibliography({
  ids,
  className,
  as: Component = 'div',
  itemsPerSlide = DEFAULT_ITEMS_PER_SLIDE,
}: BibliographyProps) {
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

  if (itemsPerSlide !== false && items.length > itemsPerSlide) {
    const chunks = formatBibliographyHtmlChunks(items, style, locale, itemsPerSlide)

    return (
      <>
        {chunks.map((html, index) => (
          <section key={index} className={className} dangerouslySetInnerHTML={{ __html: html }} />
        ))}
      </>
    )
  }

  const html = formatBibliographyHtml(items, style, locale)

  return <Component className={className} dangerouslySetInnerHTML={{ __html: html }} />
}
