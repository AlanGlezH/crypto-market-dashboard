import { useId, type ReactNode } from 'react'
import {
  Area,
  CartesianGrid,
  Line,
  LineChart,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import type { MarketChart } from '../../api/types'
import { useMarketChart } from '../../hooks/useMarketChart'
import { formatUSD } from '../../utils/format'

export type PriceChartProps = {
  coinId: string
}

type ChartRow = { index: number; ms: number; price: number }

function formatAxisDate(ms: number): string {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
  }).format(new Date(ms))
}

function toRows(prices: MarketChart['prices'] | undefined): ChartRow[] {
  if (!prices?.length) {
    return []
  }
  const valid: ChartRow[] = []
  for (const [ms, price] of prices) {
    if (Number.isFinite(ms) && Number.isFinite(price)) {
      valid.push({ index: valid.length, ms, price })
    }
  }
  return valid
}

function xTickIndices(length: number): number[] {
  if (length <= 1) {
    return [0]
  }
  if (length === 2) {
    return [0, 1]
  }
  const mid = Math.floor((length - 1) / 2)
  return [0, mid, length - 1]
}

const CHART_STROKE = '#2563eb' // blue-600 — drawer mock
/** Fixed size so layout and tests stay deterministic (jsdom). */
const CHART_W = 340
const CHART_H = 220

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

function tooltipValue(value: unknown): string {
  if (typeof value === 'number') {
    return formatUSD(value)
  }
  if (typeof value === 'string') {
    const n = Number(value)
    return formatUSD(Number.isFinite(n) ? n : Number.NaN)
  }
  return formatUSD(Number.NaN)
}

function ChartLinePlot({
  rows,
  fillGradientId,
}: {
  rows: ChartRow[]
  fillGradientId: string
}) {
  return (
    <div
      className="mt-4 max-w-full overflow-x-auto rounded-lg bg-slate-50/50 px-1 py-2"
      role="img"
      aria-label="7-day price chart"
    >
      <LineChart
        width={CHART_W}
        height={CHART_H}
        data={rows}
        margin={{ top: 12, right: 6, left: 2, bottom: 8 }}
      >
        <defs>
          <linearGradient id={fillGradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.32} />
            <stop offset="100%" stopColor="#3b82f6" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid
          strokeDasharray="3 3"
          stroke="#e2e8f0"
          vertical={false}
        />
        <XAxis
          dataKey="index"
          type="number"
          domain={['dataMin', 'dataMax']}
          ticks={xTickIndices(rows.length)}
          tickFormatter={(idx: number) => formatAxisDate(rows[idx]?.ms ?? 0)}
          tick={{ fontSize: 11, fill: '#64748b' }}
          axisLine={{ stroke: '#e2e8f0' }}
        />
        <YAxis
          domain={['auto', 'auto']}
          tickFormatter={(v: number) => formatUSD(v)}
          width={58}
          tick={{ fontSize: 11, fill: '#64748b' }}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip
          formatter={(value) => [tooltipValue(value), 'Price']}
          labelFormatter={(_, payload) => {
            const row = payload?.[0]?.payload as { ms: number } | undefined
            return row
              ? new Intl.DateTimeFormat('en-US', {
                  dateStyle: 'medium',
                  timeStyle: 'short',
                }).format(new Date(row.ms))
              : ''
          }}
          contentStyle={{
            fontSize: 12,
            borderRadius: 8,
            border: '1px solid #e2e8f0',
          }}
        />
        <Area
          type="monotone"
          dataKey="price"
          stroke="none"
          fill={`url(#${fillGradientId})`}
          isAnimationActive={false}
        />
        <Line
          type="monotone"
          dataKey="price"
          stroke={CHART_STROKE}
          strokeWidth={2}
          dot={false}
          isAnimationActive={false}
        />
      </LineChart>
    </div>
  )
}

type PriceChartBodyKey = 'loading' | 'error' | 'empty' | 'chart'

function priceChartBodyKey(
  isPending: boolean,
  isError: boolean,
  rowCount: number,
): PriceChartBodyKey {
  if (isPending) return 'loading'
  if (isError) return 'error'
  if (rowCount < 2) return 'empty'
  return 'chart'
}

/** 7-day USD price series from CoinGecko `market_chart` (FR-4.4). */
export function PriceChart({ coinId }: PriceChartProps) {
  const fillGradientId = useId().replace(/:/g, '')
  const { data, isPending, isError, refetch } = useMarketChart(coinId)
  const rows = toRows(data?.prices)
  const key = priceChartBodyKey(isPending, isError, rows.length)

  const renderBody: Record<PriceChartBodyKey, () => ReactNode> = {
    loading: () => <ChartLoadingSkeleton />,
    error: () => <ChartErrorPanel onRetry={() => void refetch()} />,
    empty: () => <ChartEmptyMessage />,
    chart: () => (
      <ChartLinePlot rows={rows} fillGradientId={fillGradientId} />
    ),
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
      {renderBody[key]()}
    </section>
  )
}
