import {
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import type { ReactNode } from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import * as coingecko from '../../api/coingecko'
import { createQueryClient } from '../../queryClient'
import { useMarkets } from '../useMarkets'

vi.mock('../../api/coingecko', () => ({
  fetchMarkets: vi.fn(),
}))

describe('useMarkets', () => {
  beforeEach(() => {
    vi.mocked(coingecko.fetchMarkets).mockReset()
  })

  function createTestHarness() {
    const queryClient = createQueryClient()
    function Wrapper({ children }: { children: ReactNode }) {
      return (
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
      )
    }
    return { queryClient, Wrapper }
  }

  it('loads data on success', async () => {
    vi.mocked(coingecko.fetchMarkets).mockResolvedValue([])
    const { Wrapper, queryClient } = createTestHarness()

    const { result } = renderHook(() => useMarkets(), { wrapper: Wrapper })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toEqual([])
    expect(queryClient.getQueryData(['markets'])).toEqual([])
  })

  it('exposes error on failure', async () => {
    vi.mocked(coingecko.fetchMarkets).mockRejectedValue(new Error('network'))
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    })
    function Wrapper({ children }: { children: ReactNode }) {
      return (
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
      )
    }

    const { result } = renderHook(() => useMarkets(), { wrapper: Wrapper })

    await waitFor(() => expect(result.current.isError).toBe(true))
    expect(result.current.error).toBeInstanceOf(Error)
    expect((result.current.error as Error).message).toBe('network')
  })

  it('uses query key markets and 60s refetch interval', async () => {
    vi.mocked(coingecko.fetchMarkets).mockResolvedValue([])
    const { Wrapper, queryClient } = createTestHarness()

    renderHook(() => useMarkets(), { wrapper: Wrapper })

    await waitFor(() => {
      const q = queryClient.getQueryCache().find({ queryKey: ['markets'] })
      expect(q).toBeDefined()
      expect(q?.options.queryKey).toEqual(['markets'])
      const interval = (q?.options as { refetchInterval?: number }).refetchInterval
      expect(interval).toBe(60_000)
    })
  })
})
