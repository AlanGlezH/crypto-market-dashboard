import { formatUSD } from './format'

export function formatAxisDate(ms: number): string {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
  }).format(new Date(ms))
}

export function tooltipValue(value: unknown): string {
  if (typeof value === 'number') {
    return formatUSD(value)
  }
  if (typeof value === 'string') {
    const n = Number(value)
    return formatUSD(Number.isFinite(n) ? n : Number.NaN)
  }
  return formatUSD(Number.NaN)
}
