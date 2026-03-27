import type { CoinDetail } from '../../api/types'
import { formatDetailDate, formatPercentage, formatUSD } from '../../utils/format'

const LABEL =
  'text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500'

function Change24hInline({ pct }: { pct: number | null | undefined }) {
  if (pct == null || Number.isNaN(pct)) {
    return <span className="text-sm text-slate-500">—</span>
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
    <span
      className={`inline-flex items-center gap-1 text-sm font-semibold tabular-nums ${toneClass}`}
    >
      <span aria-hidden="true" className="text-xs">
        {arrow}
      </span>
      <span>{formatPercentage(pct)}</span>
    </span>
  )
}

export function CoinDetailSummary({ detail }: { detail: CoinDetail }) {
  const md = detail.market_data
  const price = md?.current_price?.usd
  const pct24h = md?.price_change_percentage_24h
  const ath = md?.ath?.usd
  const athDate = md?.ath_date?.usd
  const atl = md?.atl?.usd
  const atlDate = md?.atl_date?.usd

  return (
    <div className="space-y-8">
      <section aria-labelledby="detail-current-price-heading">
        <h3 id="detail-current-price-heading" className={LABEL}>
          Current price
        </h3>
        <div className="mt-2 flex flex-wrap items-baseline gap-x-3 gap-y-1">
          <p className="text-4xl font-bold tabular-nums tracking-tight text-[#1a1c21]">
            {formatUSD(price)}
          </p>
          <Change24hInline pct={pct24h ?? null} />
        </div>
      </section>

      <div className="grid grid-cols-2 gap-3">
        <section
          className="rounded-xl border border-slate-100 bg-slate-50/90 p-4 shadow-sm"
          aria-labelledby="detail-ath-heading"
        >
          <h3 id="detail-ath-heading" className={LABEL}>
            All-time high
          </h3>
          <p className="mt-2 text-lg font-bold tabular-nums text-[#1a1c21]">
            {formatUSD(ath)}
          </p>
          <p className="mt-1 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
            {formatDetailDate(athDate ?? null).toUpperCase()}
          </p>
        </section>

        <section
          className="rounded-xl border border-slate-100 bg-slate-50/90 p-4 shadow-sm"
          aria-labelledby="detail-atl-heading"
        >
          <h3 id="detail-atl-heading" className={LABEL}>
            All-time low
          </h3>
          <p className="mt-2 text-lg font-bold tabular-nums text-[#1a1c21]">
            {formatUSD(atl)}
          </p>
          <p className="mt-1 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
            {formatDetailDate(atlDate ?? null).toUpperCase()}
          </p>
        </section>
      </div>
    </div>
  )
}
