export const COIN_QUERY_KEY = 'coin'

export function getCoinIdFromSearch(search: string): string | null {
  const trimmed = search.trim()
  const qs = trimmed.startsWith('?') ? trimmed.slice(1) : trimmed
  const params = new URLSearchParams(qs)
  const raw = params.get(COIN_QUERY_KEY)
  if (raw == null) return null
  const t = raw.trim()
  return t === '' ? null : t
}

/**
 * Builds `pathname` + `?` + params with `coin` set or removed. Other params preserved.
 */
export function hrefWithCoinParam(
  pathname: string,
  search: string,
  coinId: string | null,
): string {
  const qs = search.trim().startsWith('?') ? search.trim().slice(1) : search.trim()
  const params = new URLSearchParams(qs)
  if (coinId) params.set(COIN_QUERY_KEY, coinId)
  else params.delete(COIN_QUERY_KEY)
  const next = params.toString()
  return next ? `${pathname}?${next}` : pathname
}
