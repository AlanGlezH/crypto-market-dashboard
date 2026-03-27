import { describe, expect, it } from 'vitest'
import {
  MARKETS_ERROR_MESSAGES,
  getMarketsErrorDisplay,
} from './marketsErrors'
import { RateLimitError } from '../utils/error/errors'

describe('getMarketsErrorDisplay', () => {
  it('detects RateLimitError', () => {
    expect(getMarketsErrorDisplay(new RateLimitError())).toEqual({
      message: MARKETS_ERROR_MESSAGES.rateLimited,
      variant: 'rate-limit',
    })
  })

  it('uses Error.message for other errors', () => {
    expect(getMarketsErrorDisplay(new Error('boom'))).toEqual({
      message: 'boom',
      variant: 'generic',
    })
  })

  it('uses fallback for non-Error values', () => {
    expect(getMarketsErrorDisplay(undefined)).toEqual({
      message: MARKETS_ERROR_MESSAGES.genericFallback,
      variant: 'generic',
    })
  })
})
