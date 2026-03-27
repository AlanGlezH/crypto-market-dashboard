import type { KeyboardEvent } from 'react'
import type { CoinMarket } from '../../api/types'
import {
  formatMarketCap,
  formatPercentage,
  formatUSD,
} from '../../utils/format'
import { Sparkline } from './Sparkline'

export type TableRowProps = {
  coin: CoinMarket
  /** When set, row is focusable and activates with Enter/Space (and click). */
  onActivate?: () => void
}

function Change24hCell({ pct }: { pct: number | null }) {
  if (pct == null || Number.isNaN(pct)) {
    return <span className="text-slate-600">—</span>
  }

  let toneClass: string
  let arrow: string
  if (pct > 0) {
    toneClass = 'text-emerald-600'
    arrow = '▲'
  } else if (pct < 0) {
    toneClass = 'text-red-600'
    arrow = '▼'
  } else {
    toneClass = 'text-slate-600'
    arrow = '—'
  }

  return (
    <span className={`inline-flex items-center gap-1 tabular-nums ${toneClass}`}>
      <span aria-hidden="true" className="text-xs">
        {arrow}
      </span>
      <span>{formatPercentage(pct)}</span>
    </span>
  )
}

export function TableRow({ coin, onActivate }: TableRowProps) {
  
  function handleKeyDown(e: KeyboardEvent<HTMLTableRowElement>) {
    if (!onActivate) return
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      onActivate()
    }
  }

  const interactive = Boolean(onActivate)
  const label = `${coin.name} (${coin.symbol.toUpperCase()})`

  return (
    <tr
      aria-label={interactive ? `View details: ${label}` : undefined}
      tabIndex={interactive ? 0 : undefined}
      className={`border-b border-slate-100 last:border-b-0 ${
        interactive
          ? 'cursor-pointer hover:bg-slate-50/80 focus-visible:bg-slate-50/80 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-slate-400'
          : ''
      }`}
      onClick={interactive ? onActivate : undefined}
      onKeyDown={interactive ? handleKeyDown : undefined}
    >
      <td className="px-4 py-3 tabular-nums text-slate-700">
        {coin.market_cap_rank ?? '—'}
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-3">
          <img
            src={coin.image}
            alt=""
            width={32}
            height={32}
            className="size-8 shrink-0 rounded-full bg-slate-100"
          />
          <div className="min-w-0">
            <div className="truncate font-medium text-slate-900">
              {coin.name}
            </div>
            <div className="truncate text-xs font-medium uppercase text-slate-500">
              {coin.symbol.toUpperCase()}
            </div>
          </div>
        </div>
      </td>
      <td className="px-4 py-3 text-right tabular-nums text-slate-800">
        {formatUSD(coin.current_price)}
      </td>
      <td className="px-4 py-3 text-right">
        <Change24hCell pct={coin.price_change_percentage_24h} />
      </td>
      <td className="px-4 py-3 text-right tabular-nums text-slate-800">
        {formatMarketCap(coin.market_cap)}
      </td>
      <td className="px-4 py-3 text-right align-middle">
        <Sparkline
          prices={coin.sparkline_in_7d?.price}
          change24hPercent={coin.price_change_percentage_24h}
        />
      </td>
    </tr>
  )
}
