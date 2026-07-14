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

// citeproc renumbers numeric styles (e.g. vancouver) relative to whichever
// entries are included in a single `.format()` call, so filtering per chunk
// via the `entry` option would restart numbering at 1 on every slide. To
// keep numbering consistent with the manual marker numbers used elsewhere
// in this package (see Sources.tsx), we format the full, correctly-numbered
// bibliography once and split the resulting HTML string into per-entry
// chunks instead.
function splitCslBibliographyHtml(html: string, itemsPerSlide: number): string[] {
  const bodyMatch = html.match(/^([\s\S]*?<div[^>]*\bclass="csl-bib-body"[^>]*>)([\s\S]*)(<\/div>\s*)$/)

  if (!bodyMatch) return [html]

  const [, openTag, inner, closeTag] = bodyMatch

  const entries: string[] = []
  const tagRe = /<div\b[^>]*>|<\/div>/g
  let depth = 0
  let entryStart = -1
  let match: RegExpExecArray | null

  while ((match = tagRe.exec(inner))) {
    if (!match[0].startsWith('</')) {
      if (depth === 0) entryStart = match.index
      depth++
    } else {
      depth--
      if (depth === 0) {
        entries.push(inner.slice(entryStart, tagRe.lastIndex))
      }
    }
  }

  const chunks: string[] = []

  for (let i = 0; i < entries.length; i += itemsPerSlide) {
    chunks.push(openTag + entries.slice(i, i + itemsPerSlide).join('') + closeTag)
  }

  return chunks.length > 0 ? chunks : [html]
}

export function formatBibliographyHtmlChunks(
  items: CitationItem[],
  style: string,
  locale: string,
  itemsPerSlide: number,
) {
  const html = formatBibliographyHtml(items, style, locale)

  return splitCslBibliographyHtml(String(html), itemsPerSlide)
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
