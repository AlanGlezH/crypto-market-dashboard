/** Shared sparkline series helpers (table chart + sort key). */

export function normalizeSparklinePrices(
  prices: number[] | undefined,
): number[] {
  if (!prices?.length) return []
  return prices.filter((p) => typeof p === 'number' && Number.isFinite(p))
}

/** Sort key for the 7d column: last normalized price, or `null` if none. */
export function sparklineSortValue(prices: number[] | undefined): number | null {
  const s = normalizeSparklinePrices(prices)
  if (s.length === 0) return null
  return s[s.length - 1]!
}
