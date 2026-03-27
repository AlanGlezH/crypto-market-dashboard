import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  COINGECKO_API_V3_URL,
  coingeckoApiFetch,
  fetchMarkets,
} from './coingecko'
import type { CoinMarket } from './types'
import { ApiError, RateLimitError } from '../utils/error/errors'

describe('coingeckoApiFetch', () => {
  beforeEach(() => {
    vi.stubGlobal(
      'fetch',
      vi.fn() as unknown as typeof fetch,
    )
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('throws RateLimitError on 429', async () => {
    vi.mocked(fetch).mockResolvedValue({
      status: 429,
      ok: false,
      text: async () => '',
      json: async () => ({}),
    } as Response)

    await expect(coingeckoApiFetch('/coins/list')).rejects.toBeInstanceOf(
      RateLimitError,
    )
  })

  it('throws ApiError on 500', async () => {
    vi.mocked(fetch).mockResolvedValue({
      status: 500,
      ok: false,
      statusText: 'Internal Server Error',
      text: async () => '',
      json: async () => ({}),
    } as Response)

    await expect(coingeckoApiFetch('/x')).rejects.toMatchObject({
      name: 'ApiError',
      status: 500,
    })
    await expect(coingeckoApiFetch('/x')).rejects.toBeInstanceOf(ApiError)
  })

  it('throws ApiError on 404', async () => {
    vi.mocked(fetch).mockResolvedValue({
      status: 404,
      ok: false,
      statusText: 'Not Found',
      text: async () => '{"error":"not found"}',
      json: async () => ({ error: 'not found' }),
    } as Response)

    const err = await coingeckoApiFetch('/missing').catch((e: unknown) => e)
    expect(err).toBeInstanceOf(ApiError)
    expect((err as ApiError).status).toBe(404)
  })

  it('returns parsed JSON on 200', async () => {
    const payload = { hello: 'world' }
    vi.mocked(fetch).mockResolvedValue({
      status: 200,
      ok: true,
      text: async () => JSON.stringify(payload),
      json: async () => payload,
    } as Response)

    await expect(
      coingeckoApiFetch<{ hello: string }>('/ok'),
    ).resolves.toEqual(payload)
  })
})

describe('fetchMarkets', () => {
  beforeEach(() => {
    vi.stubGlobal(
      'fetch',
      vi.fn() as unknown as typeof fetch,
    )
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('requests /coins/markets with FR-1.1 query params', async () => {
    vi.mocked(fetch).mockResolvedValue({
      status: 200,
      ok: true,
      text: async () => '[]',
      json: async () => [],
    } as Response)

    await fetchMarkets()

    expect(fetch).toHaveBeenCalledTimes(1)
    const url = String(vi.mocked(fetch).mock.calls[0][0])
    expect(url.startsWith(COINGECKO_API_V3_URL)).toBe(true)
    expect(url).toContain('/coins/markets?')
    const { searchParams } = new URL(url)
    expect(searchParams.get('vs_currency')).toBe('usd')
    expect(searchParams.get('order')).toBe('market_cap_desc')
    expect(searchParams.get('per_page')).toBe('20')
    expect(searchParams.get('page')).toBe('1')
    expect(searchParams.get('sparkline')).toBe('true')
  })

  it('returns CoinMarket[] on 200', async () => {
    const rows: CoinMarket[] = [
      {
        id: 'bitcoin',
        symbol: 'btc',
        name: 'Bitcoin',
        image: 'https://example.com/btc.png',
        current_price: 100_000,
        market_cap: 2e12,
        market_cap_rank: 1,
        price_change_percentage_24h: 1.5,
        sparkline_in_7d: { price: [1, 2, 3] },
      },
    ]
    vi.mocked(fetch).mockResolvedValue({
      status: 200,
      ok: true,
      text: async () => JSON.stringify(rows),
      json: async () => rows,
    } as Response)

    await expect(fetchMarkets()).resolves.toEqual(rows)
  })

  it('propagates RateLimitError like coingeckoApiFetch', async () => {
    vi.mocked(fetch).mockResolvedValue({
      status: 429,
      ok: false,
      text: async () => '',
      json: async () => ({}),
    } as Response)

    await expect(fetchMarkets()).rejects.toBeInstanceOf(RateLimitError)
  })
})
