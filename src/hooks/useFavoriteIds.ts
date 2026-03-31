import { useCallback, useState } from 'react'
import { loadFavoriteIds, saveFavoriteIds } from '../utils/favoritesStorage'

export function useFavoriteIds() {
  const [favoriteIds, setFavoriteIds] = useState<ReadonlySet<string>>(
    () => new Set(loadFavoriteIds()),
  )

  const toggleFavorite = useCallback((id: string) => {
    setFavoriteIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      saveFavoriteIds([...next])
      return next
    })
  }, [])

  const isFavorite = useCallback(
    (id: string) => favoriteIds.has(id),
    [favoriteIds],
  )

  return { favoriteIds, toggleFavorite, isFavorite } as const
}
