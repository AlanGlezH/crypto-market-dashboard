import type { ReactNode } from 'react'
import type { TooltipPayload } from 'recharts/types/state/tooltipSlice'
import {
  Area,
  CartesianGrid,
  Line,
  LineChart,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { formatUSD } from '../../utils/format'
import { formatAxisDate, tooltipValue } from '../../utils/priceChartFormat'
import { xTickIndices, type ChartRow } from '../../utils/priceChartModel'

const CHART_STROKE = '#2563eb'
/** Fixed size so layout and tests stay deterministic (jsdom). */
const CHART_W = 340
const CHART_H = 220

export function ChartLinePlot({
  rows,
  fillGradientId,
}: {
  rows: ChartRow[]
  fillGradientId: string
}) {
  function formatXTick(idx: number) {
    return formatAxisDate(rows[idx]?.ms ?? 0)
  }

  function formatYTick(v: number) {
    return formatUSD(v)
  }

  function formatTooltipValues(value: unknown) {
    return [tooltipValue(value), 'Price'] as [string, string]
  }

  function formatTooltipLabel(
    _label: unknown,
    payload: TooltipPayload,
  ): ReactNode {
    const row = payload[0]?.payload as { ms: number } | undefined
    return row
      ? new Intl.DateTimeFormat('en-US', {
          dateStyle: 'medium',
          timeStyle: 'short',
        }).format(new Date(row.ms))
      : ''
  }

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
        accessibilityLayer={false}
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
          tickFormatter={formatXTick}
          tick={{ fontSize: 11, fill: '#64748b' }}
          axisLine={{ stroke: '#e2e8f0' }}
        />
        <YAxis
          domain={['auto', 'auto']}
          tickFormatter={formatYTick}
          width={58}
          tick={{ fontSize: 11, fill: '#64748b' }}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip
          formatter={formatTooltipValues}
          labelFormatter={formatTooltipLabel}
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
