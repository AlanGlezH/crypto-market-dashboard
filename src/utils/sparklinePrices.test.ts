import { describe, expect, it } from 'vitest'
import {
  normalizeSparklinePrices,
  sparklineSortValue,
} from './sparklinePrices'

describe('sparklinePrices', () => {
  it('normalizeSparklinePrices drops non-finite values', () => {
    expect(normalizeSparklinePrices([1, NaN, 3])).toEqual([1, 3])
    expect(normalizeSparklinePrices(undefined)).toEqual([])
    expect(normalizeSparklinePrices([])).toEqual([])
  })

  it('sparklineSortValue returns last finite price or null', () => {
    expect(sparklineSortValue([10, 20, 15])).toBe(15)
    expect(sparklineSortValue([42])).toBe(42)
    expect(sparklineSortValue(undefined)).toBeNull()
    expect(sparklineSortValue([NaN])).toBeNull()
  })
})
