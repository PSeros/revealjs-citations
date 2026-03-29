'use client'

import React, {useEffect} from 'react'

import {formatCitationMarker, formatInlineCitation} from '../lib/format'
import {useSlideId} from '../lib/use-slide-id'
import {useCitationStore, useCitationStoreApi} from '../store/provider'
import type {CitationInlineMode} from '../types'

export type CiteProps = {
  id: string | string[]
  inline?: boolean | CitationInlineMode
  className?: string
  prefix?: string
  suffix?: string
}

export function Cite({
  id,
  inline = false,
  className,
  prefix = '',
  suffix = '',
}: CiteProps) {
  const {ref, slideId} = useSlideId<HTMLSpanElement>()
  const store = useCitationStoreApi()
  const ids = Array.isArray(id) ? id : [id]

  const entriesById = useCitationStore((state) => state.entriesById)
  const style = useCitationStore((state) => state.style)
  const locale = useCitationStore((state) => state.locale)
  const markerStyle = useCitationStore((state) => state.markerStyle)
  const defaultInlineMode = useCitationStore((state) => state.defaultInlineMode)
  const orderedUsedIds = useCitationStore((state) => state.orderedUsedIds)

  const items = ids.map((citationId) => entriesById[citationId]).filter(Boolean)
  const missingIds = ids.filter((citationId) => !entriesById[citationId])
  const citationNumbers = ids
    .map((citationId) => orderedUsedIds.indexOf(citationId) + 1)
    .filter((number) => number > 0)

  const inlineMode: CitationInlineMode | false =
    inline === false ? false : inline === true ? defaultInlineMode : inline

  useEffect(() => {
    if (!slideId) return
    if (items.length === 0) return

    const variant = inlineMode ? 'inline' : 'footnote'
    for (const citationId of ids) {
      if (entriesById[citationId]) {
        store.getState().registerCitation(slideId, citationId, variant)
      }
    }
  }, [slideId, ids, inlineMode, items.length, entriesById, store])

  if (missingIds.length > 0) {
    return (
      <span ref={ref} className={className}>
        [missing citation: {missingIds.join(', ')}]
      </span>
    )
  }

  const content = inlineMode
    ? formatInlineCitation(items, style, locale, inlineMode)
    : formatCitationMarker(citationNumbers, markerStyle)

  return (
    <span ref={ref} className={className}>
      {prefix}
      {content}
      {suffix}
    </span>
  )
}
