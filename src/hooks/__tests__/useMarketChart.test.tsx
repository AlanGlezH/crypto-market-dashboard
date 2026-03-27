import {
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import type { ReactNode } from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import * as coingecko from '../../api/coingecko'
import type { MarketChart } from '../../api/types'
import { createQueryClient } from '../../queryClient'
import { useMarketChart } from '../useMarketChart'

vi.mock('../../api/coingecko', () => ({
  fetchMarketChart: vi.fn(),
}))

const SAMPLE_CHART: MarketChart = {
  prices: [
    [1_000, 100],
    [2_000, 110],
  ],
}

describe('useMarketChart', () => {
  beforeEach(() => {
    vi.mocked(coingecko.fetchMarketChart).mockReset()
  })

  function createHarness() {
    const queryClient = createQueryClient()
    function Wrapper({ children }: { children: ReactNode }) {
      return (
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
      )
    }
    return { queryClient, Wrapper }
  }

  it('does not call fetch when id is null', () => {
    vi.mocked(coingecko.fetchMarketChart).mockResolvedValue(SAMPLE_CHART)
    const { Wrapper } = createHarness()

    renderHook(() => useMarketChart(null), { wrapper: Wrapper })

    expect(coingecko.fetchMarketChart).not.toHaveBeenCalled()
  })

  it('does not call fetch when id is empty string', () => {
    const { Wrapper } = createHarness()
    renderHook(() => useMarketChart(''), { wrapper: Wrapper })
    expect(coingecko.fetchMarketChart).not.toHaveBeenCalled()
  })

  it('loads chart when id is set', async () => {
    vi.mocked(coingecko.fetchMarketChart).mockResolvedValue(SAMPLE_CHART)
    const { Wrapper, queryClient } = createHarness()

    const { result } = renderHook(() => useMarketChart('bitcoin'), {
      wrapper: Wrapper,
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toEqual(SAMPLE_CHART)
    expect(coingecko.fetchMarketChart).toHaveBeenCalledWith('bitcoin')
    expect(queryClient.getQueryData(['coin', 'chart', 'bitcoin'])).toEqual(
      SAMPLE_CHART,
    )
  })

  it('uses ~5 min staleTime', async () => {
    vi.mocked(coingecko.fetchMarketChart).mockResolvedValue(SAMPLE_CHART)
    const { Wrapper, queryClient } = createHarness()

    renderHook(() => useMarketChart('bitcoin'), { wrapper: Wrapper })

    await waitFor(() => {
      const q = queryClient
        .getQueryCache()
        .find({ queryKey: ['coin', 'chart', 'bitcoin'] })
      expect(q).toBeDefined()
      const staleTime = (q?.options as { staleTime?: number }).staleTime
      expect(staleTime).toBe(5 * 60_000)
    })
  })

  it('exposes error when fetch fails', async () => {
    vi.mocked(coingecko.fetchMarketChart).mockRejectedValue(new Error('boom'))
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    })
    function Wrapper({ children }: { children: ReactNode }) {
      return (
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
      )
    }

    const { result } = renderHook(() => useMarketChart('bitcoin'), {
      wrapper: Wrapper,
    })

    await waitFor(() => expect(result.current.isError).toBe(true))
    expect((result.current.error as Error).message).toBe('boom')
  })
})
