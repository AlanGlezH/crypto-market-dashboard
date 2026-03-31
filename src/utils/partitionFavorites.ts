export function partitionFavorites<T extends { id: string }>(
  items: T[],
  favoriteIds: ReadonlySet<string>,
): T[] {
  const favorites: T[] = []
  const rest: T[] = []
  for (const item of items) {
    if (favoriteIds.has(item.id)) {
      favorites.push(item)
    } else {
      rest.push(item)
    }
  }
  return [...favorites, ...rest]
}
