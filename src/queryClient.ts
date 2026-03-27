import { QueryClient } from '@tanstack/react-query'
import { RateLimitError } from './utils/error/errors'

/** Shared defaults for all queries (DESIGN §4). */
export function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // Slightly under markets `refetchInterval` (60s) to avoid extra refetches on focus/remount.
        staleTime: 55_000,
        retry: (failureCount, error) =>
          error instanceof RateLimitError ? false : failureCount < 2,
      },
    },
  })
}
