const FORMAT_EMPTY = '—'
const TRILLION = 1_000_000_000_000
const BILLION = 1_000_000_000
const MILLION = 1_000_000

const usdFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

// Avoid mixing style:"currency" with significantDigits due to strict TS Intl types;
// prepend "$" manually instead.
const usdBelowOneFormatter = new Intl.NumberFormat('en-US', {
  minimumSignificantDigits: 3,
  maximumSignificantDigits: 6,
})

const percentFormatter = new Intl.NumberFormat('en-US', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
  signDisplay: 'exceptZero',
})

const dateFormatter = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: 'numeric',
  year: 'numeric',
})

export function formatUSD(value: number | null | undefined): string {
  if (value == null || Number.isNaN(value)) return FORMAT_EMPTY
  if (value >= 1) return usdFormatter.format(value)
  return `$${usdBelowOneFormatter.format(value)}`
}

export function formatPercentage(value: number | null | undefined): string {
  if (value == null || Number.isNaN(value)) return FORMAT_EMPTY
  const rounded = parseFloat(value.toFixed(2))
  const display = rounded === 0 ? 0 : value
  return `${percentFormatter.format(display)}%`
}

export function formatMarketCap(value: number | null | undefined): string {
  if (value == null || Number.isNaN(value)) return FORMAT_EMPTY
  if (value >= TRILLION) return `$${(value / TRILLION).toFixed(2)}T`
  if (value >= BILLION) return `$${(value / BILLION).toFixed(1)}B`
  if (value >= MILLION) return `$${(value / MILLION).toFixed(0)}M`
  return `$${value.toLocaleString('en-US')}`
}

export function formatDetailDate(dateString: string | null | undefined): string {
  if (dateString == null) return FORMAT_EMPTY
  const date = new Date(dateString)
  if (Number.isNaN(date.getTime())) return FORMAT_EMPTY
  return dateFormatter.format(date)
}
