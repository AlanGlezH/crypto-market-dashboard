import type { ChartRow, PriceChartBodyKey } from '../../utils/priceChartModel'
import { ChartLinePlot } from './ChartLinePlot'

function ChartLoadingSkeleton() {
  return (
    <div
      className="mt-3 h-[220px] animate-pulse rounded-lg bg-slate-200"
      aria-busy="true"
      aria-label="Loading price chart"
    />
  )
}

function ChartErrorPanel({ onRetry }: { onRetry: () => void }) {
  return (
    <div
      className="mt-3 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-900"
      role="alert"
    >
      <p className="font-medium">Couldn’t load price chart.</p>
      <button
        type="button"
        className="mt-2 rounded-md bg-red-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-red-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-700"
        onClick={onRetry}
      >
        Retry
      </button>
    </div>
  )
}

function ChartEmptyMessage() {
  return (
    <p className="mt-3 text-sm text-slate-500">
      Not enough data to show a chart for this period.
    </p>
  )
}

export type PriceChartBodyProps = {
  bodyKey: PriceChartBodyKey
  rows: ChartRow[]
  fillGradientId: string
  onRetry: () => void
}

export function PriceChartBody({
  bodyKey,
  rows,
  fillGradientId,
  onRetry,
}: PriceChartBodyProps) {
  if (bodyKey === 'loading') {
    return <ChartLoadingSkeleton />
  }
  if (bodyKey === 'error') {
    return <ChartErrorPanel onRetry={onRetry} />
  }
  if (bodyKey === 'empty') {
    return <ChartEmptyMessage />
  }
  return <ChartLinePlot rows={rows} fillGradientId={fillGradientId} />
}
