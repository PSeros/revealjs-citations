'use client'

import React from 'react'

import { formatCitationMarker, formatFootnoteShortCitation } from '../lib/format'
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
  const markerStyle = useCitationStore((state) => state.markerStyle)
  const orderedUsedIds = useCitationStore((state) => state.orderedUsedIds)

  const rendered = footnoteIds.reduce<Array<{id: string; content: React.ReactNode}>>((acc, id) => {
    const item = entriesById[id]
    if (!item) return acc

    const text = formatFootnoteShortCitation(item, style, locale)
    const markerNumber = orderedUsedIds.indexOf(id) + 1
    const marker = markerNumber > 0 ? formatCitationMarker([markerNumber], markerStyle) : formatCitationMarker([], markerStyle)

    acc.push({
      id,
      content: showMarkers && markerNumber > 0 ? <>{marker} {text}</> : text,
    })

    return acc
  }, [])

  return (
    <Component ref={ref} className={className}>
      {rendered.map(({id, content}, index) => (
        <React.Fragment key={`${slideId ?? 'slide'}:${index}:${id}`}>
          {index > 0 ? separator : null}
          <span>{content}</span>
        </React.Fragment>
      ))}
    </Component>
  )
}

export const FootnoteSources = Sources
