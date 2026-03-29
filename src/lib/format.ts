import React from 'react'
import Cite from 'citation-js'

import type {
  CitationInlineMode,
  CitationItem,
  CitationMarkerStyle,
} from '../types'

function formatSingleParentheticalCitation(item: CitationItem, style: string, locale: string) {
  const cite = new Cite(item)

  return String(
    cite.format('citation', {
      template: style,
      lang: locale,
      format: 'text',
    }),
  ).trim()
}

function formatSingleNarrativeCitation(item: CitationItem, style: string, locale: string) {
  const cite = new Cite([item])

  const authorOnly = String(
    cite.format('citation', {
      template: style,
      lang: locale,
      format: 'text',
      entry: [{id: item.id, 'author-only': true}],
    }),
  )
    .trim()
    .replace(/[;,]\s*$/g, '')

  const suppressAuthor = String(
    cite.format('citation', {
      template: style,
      lang: locale,
      format: 'text',
      entry: [{id: item.id, 'suppress-author': true}],
    }),
  ).trim()

  return `${authorOnly} ${suppressAuthor}`.trim()
}

export function formatInlineCitation(
  items: CitationItem[],
  style: string,
  locale: string,
  mode: CitationInlineMode = 'parenthetical',
) {
  if (items.length === 0) return ''

  if (mode === 'narrative') {
    return items
      .map((item) => formatSingleNarrativeCitation(item, style, locale))
      .join('; ')
  }

  const cite = new Cite(items)

  return String(
    cite.format('citation', {
      template: style,
      lang: locale,
      format: 'text',
    }),
  ).trim()
}

export function formatFootnoteShortCitation(item: CitationItem, style: string, locale: string) {
  const inline = formatInlineCitation([item], style, locale, 'narrative').trim()

  return inline.replace(/^\((.*)\)$/s, '$1').trim()
}

export function formatBibliographyEntry(item: CitationItem, style: string, locale: string) {
  const cite = new Cite(item)

  return String(
    cite.format('bibliography', {
      template: style,
      lang: locale,
      format: 'text',
    }),
  )
    .replace(/^[\s\n]+|[\s\n]+$/g, '')
    .replace(/^\d+\.\s*/, '')
}

export function formatBibliographyHtml(items: CitationItem[], style: string, locale: string) {
  const cite = new Cite(items)

  return cite.format('bibliography', {
    template: style,
    lang: locale,
    format: 'html',
  })
}

export function formatCitationMarker(numbers: number[], markerStyle: CitationMarkerStyle = 'brackets'): React.ReactNode {
  if (numbers.length === 0) {
    return markerStyle === 'superscript' ? React.createElement('sup', null, '?') : '[?]'
  }

  const text = numbers.join(', ')

  if (markerStyle === 'superscript') {
    return React.createElement('sup', null, text)
  }

  return `[${text}]`
}
