import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { coingeckoApiFetch } from './coingecko'
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
