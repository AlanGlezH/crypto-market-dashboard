import { useMemo, useState } from 'react'
import type { CoinMarket } from '../../api/types'
import { useFavoriteIds } from '../../hooks/useFavoriteIds'
import { EmptyState } from '../shared/EmptyState'
import { SearchInput } from '../shared/SearchInput'
import { filterCoinsBySearch } from '../../utils/marketSearch'
import { partitionFavorites } from '../../utils/partitionFavorites'
import {
  DEFAULT_MARKET_SORT,
  defaultSortDirection,
  sortCoins,
  type MarketSortColumn,
  type SortDirection,
} from '../../utils/sort'
import { SortHeader } from './SortHeader'
import { TableRow } from './TableRow'

const MARKET_TABLE_COLUMNS = [
  { label: 'Rank', align: 'start' as const, sortKey: 'rank' as const },
  { label: 'Coin', align: 'start' as const, sortKey: 'name' as const },
  { label: 'Price (USD)', align: 'end' as const, sortKey: 'price' as const },
  {
    label: '24h change',
    align: 'end' as const,
    sortKey: 'change24h' as const,
  },
  {
    label: 'Market cap',
    align: 'end' as const,
    sortKey: 'marketCap' as const,
  },
  {
    label: '7d trend',
    align: 'end' as const,
    sortKey: 'sparkline7d' as const,
  },
] as const

type MarketTableRowProps = {
  coin: CoinMarket
  selected: boolean
  isFavorite: boolean
  onSelectCoin?: (id: string) => void
  onToggleFavorite: () => void
}

function MarketTableRow({
  coin,
  selected,
  isFavorite,
  onSelectCoin,
  onToggleFavorite,
}: MarketTableRowProps) {
  function handleActivate() {
    onSelectCoin?.(coin.id)
  }

  return (
    <TableRow
      coin={coin}
      selected={selected}
      isFavorite={isFavorite}
      onActivate={onSelectCoin ? handleActivate : undefined}
      onToggleFavorite={onToggleFavorite}
    />
  )
}

export type MarketTableProps = {
  coins: CoinMarket[]
  onSelectCoin?: (id: string) => void
  selectedCoinId?: string | null
}

export function MarketTable({
  coins,
  onSelectCoin,
  selectedCoinId,
}: MarketTableProps) {
  const { favoriteIds, toggleFavorite } = useFavoriteIds()
  const [searchQuery, setSearchQuery] = useState('')
  const [sort, setSort] = useState<{
    column: MarketSortColumn
    direction: SortDirection
  }>(DEFAULT_MARKET_SORT)

  const filteredCoins = useMemo(
    () => filterCoinsBySearch(coins, searchQuery),
    [coins, searchQuery],
  )

  const sortedCoins = useMemo(
    () => sortCoins(filteredCoins, sort.column, sort.direction),
    [filteredCoins, sort.column, sort.direction],
  )

  const displayCoins = useMemo(
    () => partitionFavorites(sortedCoins, favoriteIds),
    [sortedCoins, favoriteIds],
  )

  function handleSort(column: MarketSortColumn) {
    setSort((prev) => {
      if (prev.column === column) {
        return {
          column,
          direction: prev.direction === 'asc' ? 'desc' : 'asc',
        }
      }
      return { column, direction: defaultSortDirection(column) }
    })
  }

  if (coins.length === 0) {
    return (
      <div className="rounded-lg border border-slate-200 bg-white shadow-sm">
        <EmptyState
          title="No market data"
          description="Markets will appear here once data loads successfully."
        />
      </div>
    )
  }

  const showSearchEmpty =
    filteredCoins.length === 0 && searchQuery.trim() !== ''

  return (
    <div className="rounded-lg border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-200 px-4 py-3">
        <SearchInput
          id="market-search"
          label="Search markets"
          value={searchQuery}
          onChange={setSearchQuery}
        />
      </div>
      {showSearchEmpty ? (
        <EmptyState
          title="No coins match your search"
          description="Try another name or symbol."
        />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                <th scope="col" className="w-10 p-0 align-middle">
                  <span className="sr-only">Favorites</span>
                </th>
                {MARKET_TABLE_COLUMNS.map((col) => (
                  <SortHeader
                    key={col.label}
                    label={col.label}
                    column={col.sortKey}
                    activeColumn={sort.column}
                    direction={sort.direction}
                    align={col.align}
                    onSort={handleSort}
                  />
                ))}
              </tr>
            </thead>
            <tbody>
              {displayCoins.map((coin) => (
                <MarketTableRow
                  key={coin.id}
                  coin={coin}
                  selected={coin.id === selectedCoinId}
                  isFavorite={favoriteIds.has(coin.id)}
                  onSelectCoin={onSelectCoin}
                  onToggleFavorite={() => {
                    toggleFavorite(coin.id)
                  }}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
