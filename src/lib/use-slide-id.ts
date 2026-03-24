'use client'

import { useEffect, useRef, useState } from 'react'

import { getOrCreateSlideId } from './slide-id'

export function useSlideId<T extends HTMLElement>() {
  const ref = useRef<T | null>(null)
  const [slideId, setSlideId] = useState<string | null>(null)

  useEffect(() => {
    setSlideId(getOrCreateSlideId(ref.current))
  }, [])

  return { ref, slideId }
}
