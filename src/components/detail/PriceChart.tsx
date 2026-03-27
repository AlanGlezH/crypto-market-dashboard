import { useId } from 'react'
import { useMarketChart } from '../../hooks/useMarketChart'
import { PriceChartBody } from './PriceChartBody'
import { priceChartBodyKey, toRows } from '../../utils/priceChartModel'

export type PriceChartProps = {
  coinId: string
}

/** 7-day USD price series from CoinGecko `market_chart` (FR-4.4). */
export function PriceChart({ coinId }: PriceChartProps) {
  const fillGradientId = useId().replace(/:/g, '')
  const { data, isPending, isError, refetch } = useMarketChart(coinId)
  const rows = toRows(data?.prices)
  const bodyKey = priceChartBodyKey(isPending, isError, rows.length)

  function handleChartRetry() {
    void refetch()
  }

  return (
    <section
      className="mt-10 border-t border-slate-100 pt-8"
      aria-labelledby="price-chart-heading"
    >
      <h3
        id="price-chart-heading"
        className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500"
      >
        7-day price (USD)
      </h3>
      <PriceChartBody
        bodyKey={bodyKey}
        rows={rows}
        fillGradientId={fillGradientId}
        onRetry={handleChartRetry}
      />
    </section>
  )
}
