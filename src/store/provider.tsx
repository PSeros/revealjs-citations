'use client'

import React, {createContext, useContext, useEffect, useState} from 'react'
import {useStore} from 'zustand'

import {
  createCitationStore,
  type CitationStore,
  type CitationStoreState,
} from './citation-store'
import type {CitationItem} from '../types'

const CitationStoreContext = createContext<CitationStore | null>(null)

export type CitationProviderProps = {
  entries: CitationItem[]
  style?: string
  locale?: string
  children?: React.ReactNode
}

export function CitationProvider({
                                   entries,
                                   style = 'apa',
                                   locale = 'de-DE',
                                   children,
                                 }: CitationProviderProps) {
  const [store] = useState(() =>
    createCitationStore({entries, style, locale})
  )

  useEffect(() => {
    store.getState().initializeConfig(entries, style, locale)
  }, [store, entries, style, locale])

  return (
    <CitationStoreContext.Provider value={store}>
      {children}
    </CitationStoreContext.Provider>
  )
}

export function useCitationStore<T>(
  selector: (state: CitationStoreState) => T
): T {
  const store = useContext(CitationStoreContext)

  if (!store) {
    throw new Error('useCitationStore must be used inside <CitationProvider>.')
  }

  return useStore(store, selector)
}

export function useCitationStoreApi(): CitationStore {
  const store = useContext(CitationStoreContext)

  if (!store) {
    throw new Error('useCitationStoreApi must be used inside <CitationProvider>.')
  }

  return store
}