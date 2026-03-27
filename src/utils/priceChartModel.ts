import type { MarketChart } from '../api/types'

export type ChartRow = { index: number; ms: number; price: number }

export type PriceChartBodyKey = 'loading' | 'error' | 'empty' | 'chart'

export function toRows(prices: MarketChart['prices'] | undefined): ChartRow[] {
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

export function xTickIndices(length: number): number[] {
  if (length <= 1) {
    return [0]
  }
  if (length === 2) {
    return [0, 1]
  }
  const mid = Math.floor((length - 1) / 2)
  return [0, mid, length - 1]
}

export function priceChartBodyKey(
  isPending: boolean,
  isError: boolean,
  rowCount: number,
): PriceChartBodyKey {
  if (isPending) return 'loading'
  if (isError) return 'error'
  if (rowCount < 2) return 'empty'
  return 'chart'
}
