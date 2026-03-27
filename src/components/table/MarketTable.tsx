import { useMemo, useState } from 'react'
import type { CoinMarket } from '../../api/types'
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

export type MarketTableProps = {
  coins: CoinMarket[]
}

export function MarketTable({ coins }: MarketTableProps) {
  const [sort, setSort] = useState<{
    column: MarketSortColumn
    direction: SortDirection
  }>(DEFAULT_MARKET_SORT)

  const sortedCoins = useMemo(
    () => sortCoins(coins, sort.column, sort.direction),
    [coins, sort.column, sort.direction],
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

  return (
    <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white shadow-sm">
      <table className="w-full min-w-[760px] border-collapse text-left text-sm">
        <thead>
          <tr className="border-b border-slate-200 bg-slate-50">
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
          {sortedCoins.map((coin) => (
            <TableRow key={coin.id} coin={coin} />
          ))}
        </tbody>
      </table>
    </div>
  )
}
