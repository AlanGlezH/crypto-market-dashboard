import { describe, expect, it, vi } from 'vitest'
import {
  loadFavoriteIds,
  saveFavoriteIds,
  STORAGE_KEY,
} from '../favoritesStorage'

describe('favoritesStorage', () => {
  it('round-trips a valid array through save → load', () => {
    saveFavoriteIds(['bitcoin', 'ethereum'])
    expect(loadFavoriteIds()).toEqual(['bitcoin', 'ethereum'])
  })

  it('returns [] when localStorage has no entry', () => {
    localStorage.removeItem(STORAGE_KEY)
    expect(loadFavoriteIds()).toEqual([])
  })

  it('returns [] when storage contains non-array JSON', () => {
    localStorage.setItem(STORAGE_KEY, '"hello"')
    expect(loadFavoriteIds()).toEqual([])
  })

  it('returns [] when storage contains invalid JSON', () => {
    localStorage.setItem(STORAGE_KEY, '{corrupted')
    expect(loadFavoriteIds()).toEqual([])
  })

  it('dedupes repeated ids', () => {
    localStorage.setItem(STORAGE_KEY, '["bitcoin", "bitcoin"]')
    expect(loadFavoriteIds()).toEqual(['bitcoin'])
  })

  it('does not throw when localStorage.setItem throws', () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new DOMException('QuotaExceededError')
    })
    expect(() => saveFavoriteIds(['bitcoin'])).not.toThrow()
  })
})
