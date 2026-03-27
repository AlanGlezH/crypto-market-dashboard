import { QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { ReactElement } from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import * as coingecko from '../../api/coingecko'
import type { CoinDetail } from '../../api/types'
import { createQueryClient } from '../../queryClient'
import { DetailDrawer } from './DetailDrawer'

vi.mock('../../api/coingecko', () => ({
  fetchCoinDetail: vi.fn(),
}))

const FULL_DETAIL: CoinDetail = {
  id: 'bitcoin',
  name: 'Bitcoin',
  symbol: 'btc',
  image: { large: 'https://example.com/btc.png' },
  market_data: {
    current_price: { usd: 50_000 },
    ath: { usd: 69_000 },
    ath_date: { usd: '2021-11-10T00:00:00.000Z' },
    atl: { usd: 67.81 },
    atl_date: { usd: '2013-07-06T00:00:00.000Z' },
  },
}

function renderWithQuery(ui: ReactElement) {
  const queryClient = createQueryClient()
  return render(
    <QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>,
  )
}

describe('DetailDrawer', () => {
  beforeEach(() => {
    vi.mocked(coingecko.fetchCoinDetail).mockReset()
  })

  it('renders dialog with close control when mounted', async () => {
    vi.mocked(coingecko.fetchCoinDetail).mockImplementation(
      () => new Promise(() => {}),
    )
    renderWithQuery(<DetailDrawer coinId="bitcoin" onClose={vi.fn()} />)

    expect(screen.getByRole('dialog')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: /asset details/i })).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: /^close$/i }),
    ).toBeInTheDocument()
    expect(screen.getByLabelText(/loading asset details/i)).toBeInTheDocument()
  })

  it('shows coin summary when detail loads', async () => {
    vi.mocked(coingecko.fetchCoinDetail).mockResolvedValue(FULL_DETAIL)
    renderWithQuery(<DetailDrawer coinId="bitcoin" onClose={vi.fn()} />)

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /^bitcoin$/i })).toBeInTheDocument()
    })
    expect(screen.getByText('BTC')).toBeInTheDocument()
    expect(screen.getByText('Current price')).toBeInTheDocument()
    expect(screen.getByText('All-time high')).toBeInTheDocument()
    expect(screen.getByText('All-time low')).toBeInTheDocument()
    expect(screen.getByText('$50,000.00')).toBeInTheDocument()
    expect(screen.getByText('$69,000.00')).toBeInTheDocument()
    expect(screen.getByText('$67.81')).toBeInTheDocument()
  })

  it('shows skeleton while detail is loading', () => {
    vi.mocked(coingecko.fetchCoinDetail).mockImplementation(
      () => new Promise(() => {}),
    )
    renderWithQuery(<DetailDrawer coinId="ethereum" onClose={vi.fn()} />)

    expect(screen.getByLabelText(/loading asset details/i)).toBeInTheDocument()
    expect(screen.queryByText('Current price')).not.toBeInTheDocument()
  })

  it('calls onClose when Close is clicked', async () => {
    const user = userEvent.setup()
    vi.mocked(coingecko.fetchCoinDetail).mockResolvedValue(FULL_DETAIL)
    const onClose = vi.fn()
    renderWithQuery(<DetailDrawer coinId="ethereum" onClose={onClose} />)

    await user.click(screen.getByRole('button', { name: /^close$/i }))
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('calls onClose when overlay is clicked', async () => {
    const user = userEvent.setup()
    vi.mocked(coingecko.fetchCoinDetail).mockResolvedValue(FULL_DETAIL)
    const onClose = vi.fn()
    renderWithQuery(<DetailDrawer coinId="btc" onClose={onClose} />)

    await user.click(screen.getByRole('button', { name: /close drawer/i }))
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('calls onClose on Escape', async () => {
    const user = userEvent.setup()
    vi.mocked(coingecko.fetchCoinDetail).mockResolvedValue(FULL_DETAIL)
    const onClose = vi.fn()
    renderWithQuery(<DetailDrawer coinId="btc" onClose={onClose} />)

    await user.keyboard('{Escape}')
    expect(onClose).toHaveBeenCalledTimes(1)
  })
})
