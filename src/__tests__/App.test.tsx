import { QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { CoinMarket } from '../api/types'
import App from '../App'
import { useMarkets } from '../hooks/useMarkets'
import { createQueryClient } from '../queryClient'
import { RateLimitError } from '../utils/error/errors'

vi.mock('../hooks/useMarkets', () => ({
  useMarkets: vi.fn(),
}))

vi.mock('../components/detail/DetailDrawer', () => ({
  DetailDrawer: function MockDetailDrawer({
    coinId,
  }: {
    coinId: string
    onClose: () => void
  }) {
    return (
      <div role="dialog" aria-label="Asset details">
        <span data-testid="drawer-coin-id">{coinId}</span>
      </div>
    )
  },
}))

const BITCOIN_ROW: CoinMarket = {
  id: 'bitcoin',
  symbol: 'btc',
  name: 'Bitcoin',
  image: 'https://example.com/btc.png',
  current_price: 100_000,
  market_cap: 2e12,
  market_cap_rank: 1,
  price_change_percentage_24h: 1.2,
  sparkline_in_7d: { price: [1, 2, 3] },
}

function renderApp() {
  const client = createQueryClient()
  return render(
    <QueryClientProvider client={client}>
      <App />
    </QueryClientProvider>,
  )
}

describe('App', () => {
  afterEach(() => {
    window.history.pushState(null, '', '/')
  })

  beforeEach(() => {
    vi.mocked(useMarkets).mockReturnValue({
      isError: false,
      error: null,
      isPending: false,
      data: [],
      refetch: vi.fn(),
    } as unknown as ReturnType<typeof useMarkets>)
  })

  it('renders header and main; empty markets shows no-data state (not a bare table)', () => {
    renderApp()
    expect(
      screen.getByRole('heading', { level: 1, name: /clara crypto market dashboard/i }),
    ).toBeInTheDocument()
    expect(screen.getByRole('main')).toBeInTheDocument()
    expect(screen.getByText(/top 20 by market cap/i)).toBeInTheDocument()
    expect(screen.getByText('No market data')).toBeInTheDocument()
    expect(screen.queryByRole('table')).not.toBeInTheDocument()
  })

  it('shows rate-limit copy and Retry when markets query hits RateLimitError', async () => {
    const user = userEvent.setup()
    const refetch = vi.fn()
    vi.mocked(useMarkets).mockReturnValue({
      isError: true,
      error: new RateLimitError(),
      isPending: false,
      data: undefined,
      refetch,
    } as unknown as ReturnType<typeof useMarkets>)

    renderApp()

    expect(screen.getByRole('alert')).toBeInTheDocument()
    expect(
      screen.getByText(/temporarily limiting requests/i),
    ).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /^retry$/i }))
    expect(refetch).toHaveBeenCalledTimes(1)
  })

  it('shows generic error message and Retry for non-429 errors', async () => {
    const user = userEvent.setup()
    const refetch = vi.fn()
    vi.mocked(useMarkets).mockReturnValue({
      isError: true,
      error: new Error('Server exploded'),
      isPending: false,
      data: undefined,
      refetch,
    } as unknown as ReturnType<typeof useMarkets>)

    renderApp()

    expect(screen.getByText('Server exploded')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /^retry$/i }))
    expect(refetch).toHaveBeenCalledTimes(1)
  })

  it('mounts drawer when ?coin= matches a loaded market (FR-4.7)', () => {
    window.history.pushState(null, '', '/?coin=bitcoin')
    vi.mocked(useMarkets).mockReturnValue({
      isError: false,
      error: null,
      isPending: false,
      data: [BITCOIN_ROW],
      refetch: vi.fn(),
    } as unknown as ReturnType<typeof useMarkets>)

    renderApp()

    expect(screen.getByRole('dialog')).toBeInTheDocument()
    expect(screen.getByTestId('drawer-coin-id')).toHaveTextContent('bitcoin')
  })

  it('does not mount drawer when ?coin= is not in the current market list', () => {
    window.history.pushState(null, '', '/?coin=dogecoin')
    vi.mocked(useMarkets).mockReturnValue({
      isError: false,
      error: null,
      isPending: false,
      data: [BITCOIN_ROW],
      refetch: vi.fn(),
    } as unknown as ReturnType<typeof useMarkets>)

    renderApp()

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('shows skeleton table while markets query is pending', () => {
    vi.mocked(useMarkets).mockReturnValue({
      isError: false,
      error: null,
      isPending: true,
      refetch: vi.fn(),
    } as unknown as ReturnType<typeof useMarkets>)

    const { container } = renderApp()

    expect(container.querySelector('[aria-busy="true"]')).toBeTruthy()
    expect(screen.getByRole('table')).toBeInTheDocument()
    expect(
      screen.queryByText(/markets table will load here/i),
    ).not.toBeInTheDocument()
  })
})
