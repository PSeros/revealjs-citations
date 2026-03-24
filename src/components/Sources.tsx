'use client'

import React from 'react'

import { formatFootnoteShortCitation } from '../lib/format'
import { useSlideId } from '../lib/use-slide-id'
import { useCitationStore } from '../store/provider'

export type SourcesProps = {
  className?: string
  as?: React.ElementType
  separator?: React.ReactNode
  showMarkers?: boolean
}

export function Sources({
  className,
  as: Component = 'div',
  separator = ' · ',
  showMarkers = true,
}: SourcesProps) {
  const { ref, slideId } = useSlideId<HTMLElement>()
  const slideState = useCitationStore((state) => (slideId ? state.bySlide[slideId] : undefined))
  const footnoteIds = slideState?.footnoteIds ?? []
  const entriesById = useCitationStore((state) => state.entriesById)
  const style = useCitationStore((state) => state.style)
  const locale = useCitationStore((state) => state.locale)
  const orderedUsedIds = useCitationStore((state) => state.orderedUsedIds)

  const rendered = footnoteIds
    .map((id) => {
      const item = entriesById[id]
      if (!item) return null

      const text = formatFootnoteShortCitation(item, style, locale)
      const markerNumber = orderedUsedIds.indexOf(id) + 1
      return showMarkers && markerNumber > 0 ? `[${markerNumber}] ${text}` : text
    })
    .filter((value): value is string => Boolean(value))

  return (
    <Component ref={ref} className={className}>
      {rendered.map((text, index) => (
        <React.Fragment key={`${slideId ?? 'slide'}:${index}:${text.slice(0, 24)}`}>
          {index > 0 ? separator : null}
          <span>{text}</span>
        </React.Fragment>
      ))}
    </Component>
  )
}

export const FootnoteSources = Sources
