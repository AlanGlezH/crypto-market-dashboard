import type { CoinMarket } from '../api/types'

/** Case-insensitive match on name or symbol (FR-3.2). */
export function coinMatchesSearch(coin: CoinMarket, rawQuery: string): boolean {
  const q = rawQuery.trim().toLowerCase()
  if (q === '') return true
  const name = coin.name.toLowerCase()
  const symbol = coin.symbol.toLowerCase()
  return name.includes(q) || symbol.includes(q)
}

export function filterCoinsBySearch(
  coins: CoinMarket[],
  rawQuery: string,
): CoinMarket[] {
  return coins.filter((c) => coinMatchesSearch(c, rawQuery))
}
