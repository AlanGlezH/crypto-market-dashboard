import type { ErrorBannerVariant } from '../components/ui/ErrorBanner'
import { RateLimitError } from '../utils/error/errors'

/** User-facing copy when the markets query fails (FR-5.1, FR-5.2). */

export const MARKETS_ERROR_MESSAGES = {
  rateLimited:
    'The market data service is temporarily limiting requests. Please wait a moment, then try again.',
  genericFallback: 'Something went wrong while loading markets.',
} as const

export type MarketsErrorDisplay = {
  message: string
  variant: ErrorBannerVariant
}

/** Derives banner copy and variant from the failed query error (no `instanceof` in callers). */
export function getMarketsErrorDisplay(error: unknown): MarketsErrorDisplay {
  if (error instanceof RateLimitError) {
    return {
      message: MARKETS_ERROR_MESSAGES.rateLimited,
      variant: 'rate-limit',
    }
  }
  if (error instanceof Error) {
    return { message: error.message, variant: 'generic' }
  }
  return {
    message: MARKETS_ERROR_MESSAGES.genericFallback,
    variant: 'generic',
  }
}
