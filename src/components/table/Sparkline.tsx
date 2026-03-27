import { Line, LineChart, XAxis, YAxis } from 'recharts'
import { normalizeSparklinePrices } from '../../utils/sparklinePrices'

const STROKE_POSITIVE = '#047857' // emerald-700
const STROKE_NEGATIVE = '#b91c1c' // red-700
const STROKE_NEUTRAL = '#475569' // tailwind slate-600

export type SparklineProps = {
  prices: number[] | undefined
  change24hPercent: number | null
}

function strokeFor24h(pct: number | null): string {
  if (pct == null || Number.isNaN(pct)) return STROKE_NEUTRAL
  if (pct > 0) return STROKE_POSITIVE
  if (pct < 0) return STROKE_NEGATIVE
  return STROKE_NEUTRAL
}

const SPARKLINE_W = 100
const SPARKLINE_H = 40

function Placeholder() {
  return (
    <span
      className="inline-flex shrink-0 items-center justify-end text-xs tabular-nums text-slate-500"
      style={{ width: SPARKLINE_W, height: SPARKLINE_H }}
      aria-hidden="true"
    >
      —
    </span>
  )
}

/**
 * Small 7d line chart — no axes, tooltip, or dots (DESIGN §7).
 * Uses fixed `LineChart` dimensions instead of `ResponsiveContainer` so layout
 * and tests stay deterministic (jsdom does not size percentage-based chart containers).
 */
export function Sparkline({ prices, change24hPercent }: SparklineProps) {
  const series = normalizeSparklinePrices(prices)
  if (series.length < 2) {
    return <Placeholder />
  }

  const data = series.map((value, index) => ({ i: index, v: value }))
  const stroke = strokeFor24h(change24hPercent)

  return (
    <span
      className="inline-block shrink-0 leading-none"
      role="img"
      aria-label="7-day price trend"
    >
      <LineChart
        width={SPARKLINE_W}
        height={SPARKLINE_H}
        data={data}
        margin={{ top: 4, right: 4, left: 4, bottom: 4 }}
      >
        <XAxis dataKey="i" type="number" hide padding={{ left: 0, right: 0 }} />
        <YAxis hide domain={['dataMin', 'dataMax']} />
        <Line
          type="monotone"
          dataKey="v"
          stroke={stroke}
          strokeWidth={2}
          dot={false}
          isAnimationActive={false}
        />
      </LineChart>
    </span>
  )
}
