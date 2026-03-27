import { describe, expect, it } from 'vitest'
import type { CoinMarket } from '../api/types'
import {
  DEFAULT_MARKET_SORT,
  sortCoins,
  type MarketSortColumn,
  type SortDirection,
} from './sort'

const A: CoinMarket = {
  id: 'a',
  symbol: 'aaa',
  name: 'Alpha',
  image: '',
  current_price: 100,
  market_cap: 1_000,
  market_cap_rank: 3,
  price_change_percentage_24h: 5,
  sparkline_in_7d: { price: [1, 2, 10] },
}

const B: CoinMarket = {
  id: 'b',
  symbol: 'bbb',
  name: 'Bravo',
  image: '',
  current_price: 200,
  market_cap: 2_000,
  market_cap_rank: 1,
  price_change_percentage_24h: -1,
  sparkline_in_7d: { price: [9, 8, 7] },
}

const C: CoinMarket = {
  id: 'c',
  symbol: 'ccc',
  name: 'Charlie',
  image: '',
  current_price: null,
  market_cap: null,
  market_cap_rank: null,
  price_change_percentage_24h: null,
}

const UNSORTED: CoinMarket[] = [B, C, A]

function firstIds(
  coins: CoinMarket[],
  column: MarketSortColumn,
  direction: SortDirection,
): string[] {
  return sortCoins(coins, column, direction).map((c) => c.id)
}

describe('sortCoins', () => {
  it('default sort matches market cap descending', () => {
    expect(
      firstIds(UNSORTED, DEFAULT_MARKET_SORT.column, DEFAULT_MARKET_SORT.direction),
    ).toEqual(['b', 'a', 'c'])
  })

  it('sorts by rank ascending', () => {
    expect(firstIds(UNSORTED, 'rank', 'asc')).toEqual(['b', 'a', 'c'])
  })

  it('sorts by name ascending', () => {
    expect(firstIds(UNSORTED, 'name', 'asc')).toEqual(['a', 'b', 'c'])
  })

  it('sorts by price descending', () => {
    expect(firstIds(UNSORTED, 'price', 'desc')).toEqual(['b', 'a', 'c'])
  })

  it('sorts by 24h change ascending', () => {
    expect(firstIds(UNSORTED, 'change24h', 'asc')).toEqual(['b', 'a', 'c'])
  })

  it('uses last sparkline price for sparkline7d', () => {
    expect(firstIds(UNSORTED, 'sparkline7d', 'desc')).toEqual(['a', 'b', 'c'])
    expect(firstIds(UNSORTED, 'sparkline7d', 'asc')).toEqual(['b', 'a', 'c'])
  })
})
