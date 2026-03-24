'use client'

import React, {useEffect} from 'react'

import {formatInlineCitation} from '../lib/format'
import {useSlideId} from '../lib/use-slide-id'
import {useCitationStore, useCitationStoreApi} from '../store/provider'

export type CiteProps = {
  id: string
  inline?: boolean
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

  const item = useCitationStore((state) => state.entriesById[id])
  const style = useCitationStore((state) => state.style)
  const locale = useCitationStore((state) => state.locale)
  const citationNumber = useCitationStore((state) => state.orderedUsedIds.indexOf(id) + 1)

  useEffect(() => {
    if (!slideId) return
    if (!item) return

    store.getState().registerCitation(slideId, id, inline ? 'inline' : 'footnote')
  }, [slideId, id, inline, item, store])

  if (!item) {
    return (
      <span ref={ref} className={className}>
        [missing citation: {id}]
      </span>
    )
  }

  const content = inline ? formatInlineCitation(item, style, locale) : citationNumber > 0 ? `[${citationNumber}]` : '[?]'

  return (
    <span ref={ref} className={className}>
      {prefix}
      {content}
      {suffix}
    </span>
  )
}
