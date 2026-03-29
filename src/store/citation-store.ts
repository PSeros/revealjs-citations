import { createStore, type StoreApi } from 'zustand/vanilla'

import type {
  CitationInlineMode,
  CitationItem,
  CitationMarkerStyle,
  CitationVariant,
  SlideCitationState,
} from '../types'

export type CitationStoreState = {
  entriesById: Record<string, CitationItem>
  style: string
  locale: string
  markerStyle: CitationMarkerStyle
  defaultInlineMode: CitationInlineMode
  bySlide: Record<string, SlideCitationState>
  orderedUsedIds: string[]
  initializeConfig: (
    entries: CitationItem[],
    style: string,
    locale: string,
    markerStyle: CitationMarkerStyle,
    defaultInlineMode: CitationInlineMode,
  ) => void
  registerCitation: (slideId: string, citationId: string, variant: CitationVariant) => void
  getAllUsedIds: () => string[]
  getCitationNumber: (citationId: string) => number | null
}

function pushUnique(list: string[], value: string) {
  return list.includes(value) ? list : [...list, value]
}

export function createCitationStore(initial?: {
  entries?: CitationItem[]
  style?: string
  locale?: string
  markerStyle?: CitationMarkerStyle
  defaultInlineMode?: CitationInlineMode
}) {
  const initialEntries = initial?.entries ?? []
  const initialEntriesById = Object.fromEntries(initialEntries.map((entry) => [entry.id, entry]))

  return createStore<CitationStoreState>((set, get) => ({
    entriesById: initialEntriesById,
    style: initial?.style ?? 'apa',
    locale: initial?.locale ?? 'de-DE',
    markerStyle: initial?.markerStyle ?? 'brackets',
    defaultInlineMode: initial?.defaultInlineMode ?? 'parenthetical',
    bySlide: {},
    orderedUsedIds: [],
    initializeConfig(entries, style, locale, markerStyle, defaultInlineMode) {
      const entriesById = Object.fromEntries(entries.map((entry) => [entry.id, entry]))
      set({ entriesById, style, locale, markerStyle, defaultInlineMode })
    },
    registerCitation(slideId, citationId, variant) {
      set((state) => {
        const current = state.bySlide[slideId] ?? {
          usedIds: [],
          footnoteIds: [],
        }

        const next: SlideCitationState = {
          usedIds: pushUnique(current.usedIds, citationId),
          footnoteIds:
            variant === 'footnote'
              ? pushUnique(current.footnoteIds, citationId)
              : current.footnoteIds,
        }

        const orderedUsedIds = pushUnique(state.orderedUsedIds, citationId)

        if (
          next.usedIds === current.usedIds &&
          next.footnoteIds === current.footnoteIds &&
          orderedUsedIds === state.orderedUsedIds
        ) {
          return state
        }

        return {
          ...state,
          orderedUsedIds,
          bySlide: {
            ...state.bySlide,
            [slideId]: next,
          },
        }
      })
    },
    getAllUsedIds() {
      return get().orderedUsedIds
    },
    getCitationNumber(citationId) {
      const index = get().orderedUsedIds.indexOf(citationId)
      return index >= 0 ? index + 1 : null
    },
  }))
}

export type CitationStore = StoreApi<CitationStoreState>
