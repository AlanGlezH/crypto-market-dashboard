import type { CoinMarket } from '../../api/types'
import { TableRow } from './TableRow'

const MARKET_TABLE_COLUMNS = [
  { label: 'Rank', align: 'start' as const },
  { label: 'Coin', align: 'start' as const },
  { label: 'Price (USD)', align: 'end' as const },
  { label: '24h change', align: 'end' as const },
  { label: 'Market cap', align: 'end' as const },
  { label: '7d trend', align: 'end' as const },
] as const

const HEADER_BASE =
  'px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500'

export type MarketTableProps = {
  coins: CoinMarket[]
}

export function MarketTable({ coins }: MarketTableProps) {
  return (
    <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white shadow-sm">
      <table className="w-full min-w-[760px] border-collapse text-left text-sm">
        <thead>
          <tr className="border-b border-slate-200 bg-slate-50">
            {MARKET_TABLE_COLUMNS.map((col) => (
              <th
                key={col.label}
                scope="col"
                className={
                  col.align === 'end'
                    ? `${HEADER_BASE} text-right`
                    : HEADER_BASE
                }
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {coins.map((coin) => (
            <TableRow key={coin.id} coin={coin} />
          ))}
        </tbody>
      </table>
    </div>
  )
}
