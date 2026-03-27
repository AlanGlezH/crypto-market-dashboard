import type { ErrorBannerVariant } from '../components/shared/ErrorBanner'
import { ApiError, RateLimitError } from '../utils/error/errors'

/** User-facing copy when the markets query fails (FR-5.1, FR-5.2). */

export const MARKETS_ERROR_MESSAGES = {
  rateLimited: 'Too many requests. Try again in a moment.',
  genericFallback:
    'We couldn’t load market data. Check your connection and try again.',
} as const

export type MarketsErrorDisplay = {
  message: string
  variant: ErrorBannerVariant
  /** Footer metadata capsule, e.g. `SYSTEM API 429`. */
  metaLeft: string
}

/** Browsers often surface blocked or aborted requests as `Failed to fetch`; show rate-limit guidance. */
function isFailedToFetchMessage(message: string): boolean {
  return /^failed to fetch\.?$/i.test(message.trim())
}

/** Derives banner copy and variant from the failed query error (no `instanceof` in callers). */
export function getMarketsErrorDisplay(error: unknown): MarketsErrorDisplay {
  if (error instanceof RateLimitError) {
    return {
      message: MARKETS_ERROR_MESSAGES.rateLimited,
      variant: 'rate-limit',
      metaLeft: 'SYSTEM API 429',
    }
  }
  if (error instanceof ApiError) {
    return {
      message: error.message,
      variant: 'generic',
      metaLeft: `SYSTEM API ${error.status}`,
    }
  }
  if (error instanceof Error && isFailedToFetchMessage(error.message)) {
    return {
      message: MARKETS_ERROR_MESSAGES.rateLimited,
      variant: 'rate-limit',
      metaLeft: 'SYSTEM API 429',
    }
  }
  if (error instanceof Error) {
    return {
      message: error.message,
      variant: 'generic',
      metaLeft: 'SYSTEM API ERR',
    }
  }
  return {
    message: MARKETS_ERROR_MESSAGES.genericFallback,
    variant: 'generic',
    metaLeft: 'SYSTEM API ERR',
  }
}
