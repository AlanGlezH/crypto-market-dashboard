import { describe, expect, it } from 'vitest'
import {
  COIN_QUERY_KEY,
  getCoinIdFromSearch,
  hrefWithCoinParam,
} from './coinSearchParam'

describe('coinSearchParam', () => {
  it('getCoinIdFromSearch reads coin id', () => {
    expect(getCoinIdFromSearch('?coin=bitcoin')).toBe('bitcoin')
    expect(getCoinIdFromSearch('?foo=1&coin=ethereum')).toBe('ethereum')
    expect(getCoinIdFromSearch('')).toBeNull()
    expect(getCoinIdFromSearch(`?${COIN_QUERY_KEY}=`)).toBeNull()
    expect(getCoinIdFromSearch(`?${COIN_QUERY_KEY}=  `)).toBeNull()
  })

  it('hrefWithCoinParam sets or removes coin and keeps other params', () => {
    expect(hrefWithCoinParam('/', '', 'btc')).toBe(`/?${COIN_QUERY_KEY}=btc`)
    expect(hrefWithCoinParam('/app', '?foo=bar', 'x')).toBe(
      `/app?foo=bar&${COIN_QUERY_KEY}=x`,
    )
    expect(hrefWithCoinParam('/app', `?${COIN_QUERY_KEY}=x&foo=1`, null)).toBe(
      '/app?foo=1',
    )
  })
})
