import type { CoinDetail } from '../../api/types'
import { getCoinImageSrc } from '../../utils/coinDetailDisplay'
import { formatDetailDate, formatUSD } from '../../utils/format'

export function CoinDetailSummary({ detail }: { detail: CoinDetail }) {
  const md = detail.market_data
  const price = md?.current_price?.usd
  const ath = md?.ath?.usd
  const athDate = md?.ath_date?.usd
  const atl = md?.atl?.usd
  const atlDate = md?.atl_date?.usd
  const imageSrc = getCoinImageSrc(detail.image)
  const symbol = detail.symbol?.toUpperCase() ?? '—'

  return (
    <div className="space-y-6">
      <div className="flex items-start gap-4">
        {imageSrc ? (
          <img
            src={imageSrc}
            alt={`${detail.name} logo`}
            width={64}
            height={64}
            className="h-16 w-16 shrink-0 rounded-full object-cover"
          />
        ) : (
          <div
            className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-slate-200 text-lg font-semibold text-slate-600"
            aria-hidden
          >
            {(detail.name?.[0] ?? '?').toUpperCase()}
          </div>
        )}
        <div className="min-w-0 flex-1">
          <p className="truncate text-2xl font-semibold text-slate-900">
            {detail.name}
          </p>
          <p className="text-sm font-medium uppercase tracking-wide text-slate-500">
            {symbol}
          </p>
        </div>
      </div>

      <section aria-labelledby="detail-current-price-heading">
        <h3
          id="detail-current-price-heading"
          className="text-xs font-semibold uppercase tracking-wide text-slate-500"
        >
          Current price
        </h3>
        <p className="mt-1 text-2xl font-semibold tabular-nums text-slate-900">
          {formatUSD(price)}
        </p>
      </section>

      <div className="space-y-4 border-t border-slate-100 pt-4">
        <section aria-labelledby="detail-ath-heading">
          <h3
            id="detail-ath-heading"
            className="text-xs font-semibold uppercase tracking-wide text-slate-500"
          >
            All-time high
          </h3>
          <p className="mt-1 font-medium tabular-nums text-slate-900">
            {formatUSD(ath)}
          </p>
          <p className="mt-0.5 text-sm text-slate-600">
            {formatDetailDate(athDate ?? null)}
          </p>
        </section>

        <section aria-labelledby="detail-atl-heading">
          <h3
            id="detail-atl-heading"
            className="text-xs font-semibold uppercase tracking-wide text-slate-500"
          >
            All-time low
          </h3>
          <p className="mt-1 font-medium tabular-nums text-slate-900">
            {formatUSD(atl)}
          </p>
          <p className="mt-0.5 text-sm text-slate-600">
            {formatDetailDate(atlDate ?? null)}
          </p>
        </section>
      </div>
    </div>
  )
}
