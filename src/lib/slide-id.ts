function generateFallbackId() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return `slide:${crypto.randomUUID()}`
  }

  return `slide:${Math.random().toString(36).slice(2)}`
}

export function getOrCreateSlideId(node: HTMLElement | null): string | null {
  const section = node?.closest('section') as HTMLElement | null
  if (!section) return null

  if (section.id) {
    return `section:${section.id}`
  }

  const existing = section.getAttribute('data-citation-slide-id')
  if (existing) return existing

  const created = generateFallbackId()
  section.setAttribute('data-citation-slide-id', created)
  return created
}
