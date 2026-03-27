import { ApiError, RateLimitError } from '../utils/error/errors'
import type { CoinDetail, CoinMarket } from './types'

export const COINGECKO_API_V3_URL = 'https://api.coingecko.com/api/v3'

const MARKETS_SEARCH = new URLSearchParams({
  vs_currency: 'usd',
  order: 'market_cap_desc',
  per_page: '20',
  page: '1',
  sparkline: 'true',
})

const COIN_DETAIL_SEARCH = new URLSearchParams({
  localization: 'false',
  tickers: 'false',
  community_data: 'false',
  developer_data: 'false',
})

/**
 * GET JSON from CoinGecko v3. Throws {@link RateLimitError} on 429,
 * {@link ApiError} on other non-OK responses.
 */
export async function coingeckoApiFetch<T>(path: string): Promise<T> {
  const res = await fetch(`${COINGECKO_API_V3_URL}${path}`)

  if (res.status === 429) {
    throw new RateLimitError()
  }

  if (!res.ok) {
    const text = await res.text()
    const message =
      text.length > 0 ? text.slice(0, 200) : res.statusText || `HTTP ${res.status}`
    throw new ApiError(message, res.status)
  }

  const body: unknown = await res.json()
  return body as T
}

/** Top 20 coins by USD market cap with 7d sparkline (FR-1.1). */
export function fetchMarkets(): Promise<CoinMarket[]> {
  return coingeckoApiFetch<CoinMarket[]>(`/coins/markets?${MARKETS_SEARCH.toString()}`)
}

/** Single coin for detail drawer (FR-4.2). */
export function fetchCoinDetail(id: string): Promise<CoinDetail> {
  const path = `/coins/${encodeURIComponent(id)}?${COIN_DETAIL_SEARCH.toString()}`
  return coingeckoApiFetch<CoinDetail>(path)
}
