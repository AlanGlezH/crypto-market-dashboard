import { describe, expect, it } from 'vitest'
import {
  MARKETS_ERROR_MESSAGES,
  getMarketsErrorDisplay,
} from '../marketsErrors'
import { ApiError, RateLimitError } from '../../utils/error/errors'

describe('getMarketsErrorDisplay', () => {
  it('detects RateLimitError', () => {
    expect(getMarketsErrorDisplay(new RateLimitError())).toEqual({
      message: MARKETS_ERROR_MESSAGES.rateLimited,
      variant: 'rate-limit',
      metaLeft: 'SYSTEM API 429',
    })
  })

  it('uses ApiError status in meta', () => {
    expect(getMarketsErrorDisplay(new ApiError('nope', 503))).toEqual({
      message: 'nope',
      variant: 'generic',
      metaLeft: 'SYSTEM API 503',
    })
  })

  it('maps Failed to fetch to rate-limit guidance', () => {
    expect(getMarketsErrorDisplay(new Error('Failed to fetch'))).toEqual({
      message: MARKETS_ERROR_MESSAGES.rateLimited,
      variant: 'rate-limit',
      metaLeft: 'SYSTEM API 429',
    })
    expect(getMarketsErrorDisplay(new Error('failed to fetch'))).toEqual({
      message: MARKETS_ERROR_MESSAGES.rateLimited,
      variant: 'rate-limit',
      metaLeft: 'SYSTEM API 429',
    })
  })

  it('uses Error.message for other errors', () => {
    expect(getMarketsErrorDisplay(new Error('boom'))).toEqual({
      message: 'boom',
      variant: 'generic',
      metaLeft: 'SYSTEM API ERR',
    })
  })

  it('uses fallback for non-Error values', () => {
    expect(getMarketsErrorDisplay(undefined)).toEqual({
      message: MARKETS_ERROR_MESSAGES.genericFallback,
      variant: 'generic',
      metaLeft: 'SYSTEM API ERR',
    })
  })
})
