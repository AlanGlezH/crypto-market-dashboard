import { renderHook, act } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { STORAGE_KEY } from '../../utils/favoritesStorage'
import { useFavoriteIds } from '../useFavoriteIds'

describe('useFavoriteIds', () => {
  afterEach(() => {
    localStorage.removeItem(STORAGE_KEY)
  })

  it('starts empty when localStorage has no entry', () => {
    const { result } = renderHook(() => useFavoriteIds())
    expect(result.current.favoriteIds.size).toBe(0)
  })

  it('toggleFavorite adds and removes an id', () => {
    const { result } = renderHook(() => useFavoriteIds())

    act(() => {
      result.current.toggleFavorite('bitcoin')
    })
    expect(result.current.isFavorite('bitcoin')).toBe(true)

    act(() => {
      result.current.toggleFavorite('bitcoin')
    })
    expect(result.current.isFavorite('bitcoin')).toBe(false)
  })

  it('persists to localStorage so a new hook instance reads them back', () => {
    const { result: first } = renderHook(() => useFavoriteIds())
    act(() => {
      first.current.toggleFavorite('ethereum')
    })

    const { result: second } = renderHook(() => useFavoriteIds())
    expect(second.current.isFavorite('ethereum')).toBe(true)
  })
})
