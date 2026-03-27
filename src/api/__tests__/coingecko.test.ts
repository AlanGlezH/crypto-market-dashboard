import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  COINGECKO_API_V3_URL,
  coingeckoApiFetch,
  fetchCoinDetail,
  fetchMarkets,
  fetchMarketChart,
} from '../coingecko'
import type { CoinDetail } from '../types'
import type { CoinMarket } from '../types'
import { ApiError, RateLimitError } from '../../utils/error/errors'

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

  it('throws RateLimitError when fetch rejects (CORS-opaque 429)', async () => {
    vi.mocked(fetch).mockRejectedValue(new TypeError('Failed to fetch'))

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

describe('fetchCoinDetail', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn() as unknown as typeof fetch)
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('requests /coins/{id} with FR-4.2 query params', async () => {
    vi.mocked(fetch).mockResolvedValue({
      status: 200,
      ok: true,
      text: async () => '{}',
      json: async () => ({ id: 'bitcoin', name: 'Bitcoin', symbol: 'btc' }),
    } as Response)

    await fetchCoinDetail('bitcoin')

    expect(fetch).toHaveBeenCalledTimes(1)
    const url = String(vi.mocked(fetch).mock.calls[0][0])
    expect(url.startsWith(`${COINGECKO_API_V3_URL}/coins/bitcoin?`)).toBe(true)
    const { searchParams } = new URL(url)
    expect(searchParams.get('localization')).toBe('false')
    expect(searchParams.get('tickers')).toBe('false')
    expect(searchParams.get('community_data')).toBe('false')
    expect(searchParams.get('developer_data')).toBe('false')
  })

  it('encodes coin id in path', async () => {
    vi.mocked(fetch).mockResolvedValue({
      status: 200,
      ok: true,
      text: async () => '{}',
      json: async () => ({ id: 'x', name: 'X', symbol: 'x' }),
    } as Response)

    await fetchCoinDetail('weird id')

    const url = String(vi.mocked(fetch).mock.calls[0][0])
    expect(url).toContain('/coins/weird%20id?')
  })

  it('returns CoinDetail on 200', async () => {
    const detail: CoinDetail = {
      id: 'ethereum',
      name: 'Ethereum',
      symbol: 'eth',
      market_data: {
        current_price: { usd: 3000 },
        ath: { usd: 4800 },
        ath_date: { usd: '2021-11-01T00:00:00.000Z' },
      },
    }
    vi.mocked(fetch).mockResolvedValue({
      status: 200,
      ok: true,
      text: async () => JSON.stringify(detail),
      json: async () => detail,
    } as Response)

    await expect(fetchCoinDetail('ethereum')).resolves.toEqual(detail)
  })
})

describe('fetchMarketChart', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn() as unknown as typeof fetch)
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('requests /coins/{id}/market_chart with FR-4.4 query params', async () => {
    vi.mocked(fetch).mockResolvedValue({
      status: 200,
      ok: true,
      text: async () => '{"prices":[]}',
      json: async () => ({ prices: [] as [number, number][] }),
    } as Response)

    await fetchMarketChart('bitcoin')

    expect(fetch).toHaveBeenCalledTimes(1)
    const url = String(vi.mocked(fetch).mock.calls[0][0])
    expect(url.startsWith(`${COINGECKO_API_V3_URL}/coins/bitcoin/market_chart?`)).toBe(
      true,
    )
    const { searchParams } = new URL(url)
    expect(searchParams.get('vs_currency')).toBe('usd')
    expect(searchParams.get('days')).toBe('7')
  })

  it('maps JSON prices to MarketChart', async () => {
    const prices: [number, number][] = [
      [1_700_000_000_000, 42_000],
      [1_700_000_360_000, 43_000],
    ]
    vi.mocked(fetch).mockResolvedValue({
      status: 200,
      ok: true,
      text: async () => JSON.stringify({ prices, market_caps: [], total_volumes: [] }),
      json: async () => ({ prices, market_caps: [], total_volumes: [] }),
    } as Response)

    await expect(fetchMarketChart('btc')).resolves.toEqual({ prices })
  })

  it('defaults missing prices to empty array', async () => {
    vi.mocked(fetch).mockResolvedValue({
      status: 200,
      ok: true,
      text: async () => '{}',
      json: async () => ({}),
    } as Response)

    await expect(fetchMarketChart('x')).resolves.toEqual({ prices: [] })
  })
})
