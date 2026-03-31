const STORAGE_KEY = 'crypto-market-dashboard:favorite-ids'

/** Read, validate, and dedupe favorite IDs from localStorage. Returns [] on any failure. */
export function loadFavoriteIds(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw === null) return []

    const parsed: unknown = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []

    return [...new Set(parsed as string[])]
  } catch {
    return []
  }
}

/** Persist the full array as JSON. Silently swallows quota/security errors. */
export function saveFavoriteIds(ids: string[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(ids))
  } catch (error) {
    console.error('Failed to save favorite IDs to localStorage:', error)
  }
}

export { STORAGE_KEY }
