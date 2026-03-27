/** Price, market cap, and percent formatting for the markets table (FR-2.3, FR-2.5). */

const USD = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 2,
})

export function formatUSD(value: number | null | undefined): string {
  if (value == null || Number.isNaN(value)) {
    return '—'
  }
  return USD.format(value)
}

export function formatMarketCap(n: number | null | undefined): string {
  if (n == null || Number.isNaN(n)) {
    return '—'
  }
  if (n >= 1e12) {
    return `$${(n / 1e12).toFixed(2)}T`
  }
  if (n >= 1e9) {
    return `$${(n / 1e9).toFixed(1)}B`
  }
  if (n >= 1e6) {
    return `$${(n / 1e6).toFixed(0)}M`
  }
  return `$${n.toLocaleString('en-US')}`
}

export function formatPercentage(value: number | null | undefined): string {
  if (value == null || Number.isNaN(value)) {
    return '—'
  }
  const sign = value > 0 ? '+' : ''
  return `${sign}${value.toFixed(2)}%`
}

/** ISO date strings from CoinGecko (e.g. ATH/ATL); invalid or missing → em dash. */
export function formatDetailDate(iso: string | null | undefined): string {
  if (!iso) {
    return '—'
  }
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) {
    return '—'
  }
  return new Intl.DateTimeFormat('en-US', { dateStyle: 'medium' }).format(date)
}
