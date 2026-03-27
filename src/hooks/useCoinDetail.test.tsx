import {
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import type { ReactNode } from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import * as coingecko from '../api/coingecko'
import type { CoinDetail } from '../api/types'
import { createQueryClient } from '../queryClient'
import { useCoinDetail } from './useCoinDetail'

vi.mock('../api/coingecko', () => ({
  fetchCoinDetail: vi.fn(),
}))

const SAMPLE_DETAIL: CoinDetail = {
  id: 'bitcoin',
  name: 'Bitcoin',
  symbol: 'btc',
}

describe('useCoinDetail', () => {
  beforeEach(() => {
    vi.mocked(coingecko.fetchCoinDetail).mockReset()
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
    vi.mocked(coingecko.fetchCoinDetail).mockResolvedValue(SAMPLE_DETAIL)
    const { Wrapper } = createHarness()

    const { result } = renderHook(() => useCoinDetail(null), { wrapper: Wrapper })

    expect(result.current.fetchStatus).toBe('idle')
    expect(coingecko.fetchCoinDetail).not.toHaveBeenCalled()
  })

  it('does not call fetch when id is empty string', () => {
    const { Wrapper } = createHarness()
    renderHook(() => useCoinDetail(''), { wrapper: Wrapper })
    expect(coingecko.fetchCoinDetail).not.toHaveBeenCalled()
  })

  it('loads detail when id is set', async () => {
    vi.mocked(coingecko.fetchCoinDetail).mockResolvedValue(SAMPLE_DETAIL)
    const { Wrapper, queryClient } = createHarness()

    const { result } = renderHook(() => useCoinDetail('bitcoin'), {
      wrapper: Wrapper,
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toEqual(SAMPLE_DETAIL)
    expect(coingecko.fetchCoinDetail).toHaveBeenCalledWith('bitcoin')
    expect(queryClient.getQueryData(['coin', 'detail', 'bitcoin'])).toEqual(
      SAMPLE_DETAIL,
    )
  })

  it('uses ~5 min staleTime', async () => {
    vi.mocked(coingecko.fetchCoinDetail).mockResolvedValue(SAMPLE_DETAIL)
    const { Wrapper, queryClient } = createHarness()

    renderHook(() => useCoinDetail('bitcoin'), { wrapper: Wrapper })

    await waitFor(() => {
      const q = queryClient
        .getQueryCache()
        .find({ queryKey: ['coin', 'detail', 'bitcoin'] })
      expect(q).toBeDefined()
      const staleTime = (q?.options as { staleTime?: number }).staleTime
      expect(staleTime).toBe(5 * 60_000)
    })
  })

  it('exposes error when fetch fails', async () => {
    vi.mocked(coingecko.fetchCoinDetail).mockRejectedValue(new Error('boom'))
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    })
    function Wrapper({ children }: { children: ReactNode }) {
      return (
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
      )
    }

    const { result } = renderHook(() => useCoinDetail('bitcoin'), {
      wrapper: Wrapper,
    })

    await waitFor(() => expect(result.current.isError).toBe(true))
    expect((result.current.error as Error).message).toBe('boom')
  })
})
