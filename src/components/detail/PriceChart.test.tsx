import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { ReactElement } from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import * as coingecko from '../../api/coingecko'
import type { MarketChart } from '../../api/types'
import { createQueryClient } from '../../queryClient'
import { PriceChart } from './PriceChart'

vi.mock('../../api/coingecko', () => ({
  fetchMarketChart: vi.fn(),
}))

const FIXTURE_CHART: MarketChart = {
  prices: [
    [1_700_000_000_000, 100],
    [1_700_086_400_000, 105],
    [1_700_172_800_000, 102],
    [1_700_259_200_000, 108],
  ],
}

function renderWithQuery(
  ui: ReactElement,
  client = createQueryClient(),
) {
  return render(
    <QueryClientProvider client={client}>{ui}</QueryClientProvider>,
  )
}

describe('PriceChart', () => {
  beforeEach(() => {
    vi.mocked(coingecko.fetchMarketChart).mockReset()
  })

  it('shows loading state', () => {
    vi.mocked(coingecko.fetchMarketChart).mockImplementation(
      () => new Promise(() => {}),
    )
    renderWithQuery(<PriceChart coinId="bitcoin" />)

    expect(screen.getByLabelText(/loading price chart/i)).toBeInTheDocument()
    expect(screen.queryByRole('img', { name: /7-day price chart/i })).not.toBeInTheDocument()
  })

  it('renders svg when chart data loads', async () => {
    vi.mocked(coingecko.fetchMarketChart).mockResolvedValue(FIXTURE_CHART)
    const { container } = renderWithQuery(<PriceChart coinId="bitcoin" />)

    await waitFor(() => {
      expect(container.querySelector('svg')).toBeInTheDocument()
    })
    expect(screen.getByText('7-day price (USD)')).toBeInTheDocument()
    expect(coingecko.fetchMarketChart).toHaveBeenCalledWith('bitcoin')
  })

  it('shows compact error and retry', async () => {
    const user = userEvent.setup()
    vi.mocked(coingecko.fetchMarketChart).mockRejectedValue(new Error('boom'))
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    })
    renderWithQuery(<PriceChart coinId="eth" />, queryClient)

    await waitFor(() => {
      expect(screen.getByText(/couldn’t load price chart/i)).toBeInTheDocument()
    })

    vi.mocked(coingecko.fetchMarketChart).mockResolvedValue(FIXTURE_CHART)
    await user.click(screen.getByRole('button', { name: /^retry$/i }))

    await waitFor(() => {
      expect(screen.getByRole('img', { name: /7-day price chart/i })).toBeInTheDocument()
    })
  })

  it('shows message when prices are empty', async () => {
    vi.mocked(coingecko.fetchMarketChart).mockResolvedValue({ prices: [] })
    const { container } = renderWithQuery(<PriceChart coinId="empty" />)

    await waitFor(() => {
      expect(
        screen.getByText(/not enough data to show a chart/i),
      ).toBeInTheDocument()
    })
    expect(container.querySelector('svg')).toBeNull()
  })

  it('shows message when fewer than two valid points', async () => {
    vi.mocked(coingecko.fetchMarketChart).mockResolvedValue({
      prices: [[1, 50]],
    })
    const { container } = renderWithQuery(<PriceChart coinId="one" />)

    await waitFor(() => {
      expect(
        screen.getByText(/not enough data to show a chart/i),
      ).toBeInTheDocument()
    })
    expect(container.querySelector('svg')).toBeNull()
  })
})
