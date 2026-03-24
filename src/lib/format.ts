import Cite from 'citation-js'

import type {CitationItem} from '../types'

export function formatInlineCitation(item: CitationItem, style: string, locale: string) {
  const cite = new Cite(item)

  return cite.format('citation', {
    template: style,
    lang: locale,
    format: 'text',
  })
}

export function formatFootnoteShortCitation(item: CitationItem, style: string, locale: string) {
  const inline = formatInlineCitation(item, style, locale).trim()

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
