import type { CoinMarket } from '../api/types'
import { sparklineSortValue } from './sparklinePrices'

export type SortDirection = 'asc' | 'desc'

export type MarketSortColumn =
  | 'rank'
  | 'name'
  | 'price'
  | 'change24h'
  | 'marketCap'
  | 'sparkline7d'

/** Matches API default (`order=market_cap_desc`). */
export const DEFAULT_MARKET_SORT: {
  column: MarketSortColumn
  direction: SortDirection
} = {
  column: 'marketCap',
  direction: 'desc',
}

export function defaultSortDirection(column: MarketSortColumn): SortDirection {
  switch (column) {
    case 'rank':
    case 'name':
      return 'asc'
    case 'price':
    case 'change24h':
    case 'marketCap':
    case 'sparkline7d':
      return 'desc'
  }
}

/** Nulls sort after any number (stable tie-breaker for missing API fields). */
function compareNullableNumber(
  a: number | null,
  b: number | null,
  direction: SortDirection,
): number {
  const aMissing = a === null
  const bMissing = b === null
  if (aMissing && bMissing) return 0
  if (aMissing) return 1
  if (bMissing) return -1
  const cmp = a - b
  return direction === 'asc' ? cmp : -cmp
}

function compareString(
  a: string,
  b: string,
  direction: SortDirection,
): number {
  const cmp = a.localeCompare(b, undefined, { sensitivity: 'base' })
  return direction === 'asc' ? cmp : -cmp
}

type CompareCoinsFn = (
  a: CoinMarket,
  b: CoinMarket,
  direction: SortDirection,
) => number

const compareCoinByColumn: Record<MarketSortColumn, CompareCoinsFn> = {
  rank: (a, b, direction) =>
    compareNullableNumber(a.market_cap_rank, b.market_cap_rank, direction),
  name: (a, b, direction) => compareString(a.name, b.name, direction),
  price: (a, b, direction) =>
    compareNullableNumber(a.current_price, b.current_price, direction),
  change24h: (a, b, direction) =>
    compareNullableNumber(
      a.price_change_percentage_24h,
      b.price_change_percentage_24h,
      direction,
    ),
  marketCap: (a, b, direction) =>
    compareNullableNumber(a.market_cap, b.market_cap, direction),
  sparkline7d: (a, b, direction) =>
    compareNullableNumber(
      sparklineSortValue(a.sparkline_in_7d?.price),
      sparklineSortValue(b.sparkline_in_7d?.price),
      direction,
    ),
}

function compareCoin(
  a: CoinMarket,
  b: CoinMarket,
  column: MarketSortColumn,
  direction: SortDirection,
): number {
  return compareCoinByColumn[column](a, b, direction)
}

export function sortCoins(
  coins: CoinMarket[],
  column: MarketSortColumn,
  direction: SortDirection,
): CoinMarket[] {
  return [...coins].sort((a, b) => compareCoin(a, b, column, direction))
}
