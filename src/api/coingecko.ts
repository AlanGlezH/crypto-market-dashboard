import { ApiError, RateLimitError } from '../utils/error/errors'

export const COINGECKO_API_V3_URL = 'https://api.coingecko.com/api/v3'

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
