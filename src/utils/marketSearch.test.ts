import { describe, expect, it } from 'vitest'
import type { CoinMarket } from '../api/types'
import { coinMatchesSearch, filterCoinsBySearch } from './marketSearch'

const COIN: CoinMarket = {
  id: 'bitcoin',
  symbol: 'btc',
  name: 'Bitcoin',
  image: '',
  current_price: 1,
  market_cap: 1,
  market_cap_rank: 1,
  price_change_percentage_24h: 0,
}

describe('marketSearch', () => {
  it('matches name and symbol case-insensitively', () => {
    expect(coinMatchesSearch(COIN, 'bit')).toBe(true)
    expect(coinMatchesSearch(COIN, 'BITCOIN')).toBe(true)
    expect(coinMatchesSearch(COIN, 'BtC')).toBe(true)
    expect(coinMatchesSearch(COIN, 'eth')).toBe(false)
  })

  it('trims query and treats empty as match-all', () => {
    expect(coinMatchesSearch(COIN, '  ')).toBe(true)
    expect(filterCoinsBySearch([COIN], '')).toEqual([COIN])
    expect(filterCoinsBySearch([COIN], '   ')).toEqual([COIN])
  })
})
