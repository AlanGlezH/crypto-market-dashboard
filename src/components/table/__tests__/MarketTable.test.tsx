import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { axe } from 'jest-axe'
import { describe, expect, it, vi } from 'vitest'
import type { CoinMarket } from '../../../api/types'
import { MarketTable } from '../MarketTable'

const FIXTURE_COINS: CoinMarket[] = [
  {
    id: 'bitcoin',
    symbol: 'btc',
    name: 'Bitcoin',
    image: 'https://example.com/btc.png',
    current_price: 100_000,
    market_cap: 2_000_000_000_000,
    market_cap_rank: 1,
    price_change_percentage_24h: 2.5,
    sparkline_in_7d: { price: [1, 2, 3] },
  },
  {
    id: 'ethereum',
    symbol: 'eth',
    name: 'Ethereum',
    image: 'https://example.com/eth.png',
    current_price: 3_500.25,
    market_cap: 400_000_000_000,
    market_cap_rank: 2,
    price_change_percentage_24h: -0.82,
    sparkline_in_7d: { price: [3, 2, 1] },
  },
]

describe('MarketTable', () => {
  it('renders column headers and row data with formatting', () => {
    render(<MarketTable coins={FIXTURE_COINS} />)

    expect(screen.getByRole('searchbox')).toBeInTheDocument()

    const table = screen.getByRole('table')
    expect(
      within(table).getByRole('columnheader', { name: /rank/i }),
    ).toBeInTheDocument()
    expect(
      within(table).getByRole('columnheader', { name: /24h change/i }),
    ).toBeInTheDocument()

    expect(screen.getByText('Bitcoin')).toBeInTheDocument()
    expect(screen.getByText('Ethereum')).toBeInTheDocument()
    expect(screen.getByText('BTC')).toBeInTheDocument()
    expect(screen.getByText('ETH')).toBeInTheDocument()

    expect(screen.getByText('$100,000.00')).toBeInTheDocument()
    expect(screen.getByText('$2.00T')).toBeInTheDocument()

    expect(
      within(table).getAllByRole('img', { name: '7-day price trend' }),
    ).toHaveLength(2)
  })

  it('shows non-color 24h cue: arrows (aria-hidden) plus percentage', () => {
    render(<MarketTable coins={FIXTURE_COINS} />)

    const btcRow = screen.getByText('Bitcoin').closest('tr') as HTMLElement
    const ethRow = screen.getByText('Ethereum').closest('tr') as HTMLElement

    expect(btcRow.querySelector('[aria-hidden="true"]')).toHaveTextContent('▲')
    expect(btcRow).toHaveTextContent('+2.50%')

    expect(ethRow.querySelector('[aria-hidden="true"]')).toHaveTextContent('▼')
    expect(ethRow).toHaveTextContent('-0.82%')
  })

  it('sorts when a header button is clicked and exposes aria-sort on the active column', async () => {
    const user = userEvent.setup()
    render(<MarketTable coins={FIXTURE_COINS} />)

    const table = screen.getByRole('table')
    const tbody = table.querySelector('tbody') as HTMLElement
    const firstRow = () => within(tbody).getAllByRole('row')[0]

    const coinHeader = within(table).getByRole('columnheader', { name: /coin/i })
    const coinBtn = within(coinHeader).getByRole('button', { name: /sort by coin/i })

    expect(firstRow()).toHaveTextContent('Bitcoin')
    expect(
      within(table).getByRole('columnheader', { name: /market cap/i }),
    ).toHaveAttribute('aria-sort', 'descending')

    await user.click(coinBtn)
    expect(coinHeader).toHaveAttribute('aria-sort', 'ascending')
    expect(firstRow()).toHaveTextContent('Bitcoin')

    await user.click(coinBtn)
    expect(coinHeader).toHaveAttribute('aria-sort', 'descending')
    expect(firstRow()).toHaveTextContent('Ethereum')
  })

  it('toggles sort when a header button is focused and Space is pressed', async () => {
    const user = userEvent.setup()
    render(<MarketTable coins={FIXTURE_COINS} />)

    const table = screen.getByRole('table')
    const rankHeader = within(table).getByRole('columnheader', {
      name: /rank/i,
    })
    const rankBtn = within(rankHeader).getByRole('button', { name: /sort by rank/i })
    rankBtn.focus()
    await user.keyboard(' ')
    expect(rankHeader).toHaveAttribute('aria-sort', 'ascending')
  })

  it('calls onSelectCoin from row keyboard (Enter and Space)', async () => {
    const user = userEvent.setup()
    const onSelectCoin = vi.fn()
    render(<MarketTable coins={FIXTURE_COINS} onSelectCoin={onSelectCoin} />)

    const ethRow = screen.getByRole('row', {
      name: /View details: Ethereum/i,
    })
    ethRow.focus()
    await user.keyboard('{Enter}')
    expect(onSelectCoin).toHaveBeenLastCalledWith('ethereum')
    onSelectCoin.mockClear()
    await user.keyboard(' ')
    expect(onSelectCoin).toHaveBeenLastCalledWith('ethereum')
  })

  it('filters rows by name or symbol as the user types (case-insensitive)', async () => {
    const user = userEvent.setup()
    render(<MarketTable coins={FIXTURE_COINS} />)

    const search = screen.getByRole('searchbox')
    await user.type(search, 'eth')
    expect(screen.getByText('Ethereum')).toBeInTheDocument()
    expect(screen.queryByText('Bitcoin')).not.toBeInTheDocument()

    await user.clear(search)
    await user.type(search, 'BITCOIN')
    expect(screen.getByText('Bitcoin')).toBeInTheDocument()
    expect(screen.queryByText('Ethereum')).not.toBeInTheDocument()
  })

  it('shows an empty state when the filter matches nothing', async () => {
    const user = userEvent.setup()
    render(<MarketTable coins={FIXTURE_COINS} />)

    await user.type(screen.getByRole('searchbox'), 'zzz')

    expect(screen.getByText('No coins match your search')).toBeInTheDocument()
    expect(screen.queryByRole('table')).not.toBeInTheDocument()
  })

  it('shows no-data empty state when the API returns no coins', () => {
    render(<MarketTable coins={[]} />)

    expect(screen.getByText('No market data')).toBeInTheDocument()
    expect(screen.queryByRole('searchbox')).not.toBeInTheDocument()
    expect(screen.queryByRole('table')).not.toBeInTheDocument()
  })

  it('has no axe-detectable a11y violations', async () => {
    const { container } = render(<MarketTable coins={FIXTURE_COINS} />)
    expect(await axe(container)).toHaveNoViolations()
  })
})
