import { describe, expect, it } from 'vitest'
import { formatMarketCap, formatPercentage, formatUSD } from './format'

describe('formatUSD', () => {
  it('formats whole and fractional dollars', () => {
    expect(formatUSD(69964)).toMatch(/\$69,?964/)
    expect(formatUSD(1234.56)).toBe('$1,234.56')
  })

  it('returns em dash for null, undefined, and NaN', () => {
    expect(formatUSD(null)).toBe('—')
    expect(formatUSD(undefined)).toBe('—')
    expect(formatUSD(Number.NaN)).toBe('—')
  })
})

describe('formatMarketCap', () => {
  it('uses T, B, M suffixes per DESIGN §7', () => {
    expect(formatMarketCap(1.2e12)).toBe('$1.20T')
    expect(formatMarketCap(340e9)).toBe('$340.0B')
    expect(formatMarketCap(12e6)).toBe('$12M')
  })

  it('uses locale grouping below 1M', () => {
    expect(formatMarketCap(999_999)).toBe('$999,999')
    expect(formatMarketCap(500_000)).toBe('$500,000')
  })

  it('returns em dash for null, undefined, and NaN', () => {
    expect(formatMarketCap(null)).toBe('—')
    expect(formatMarketCap(undefined)).toBe('—')
    expect(formatMarketCap(Number.NaN)).toBe('—')
  })

  it('handles zero', () => {
    expect(formatMarketCap(0)).toBe('$0')
  })
})

describe('formatPercentage', () => {
  it('adds plus for positive and minus for negative', () => {
    expect(formatPercentage(2.45)).toBe('+2.45%')
    expect(formatPercentage(-0.82)).toBe('-0.82%')
  })

  it('shows two decimals for zero without plus', () => {
    expect(formatPercentage(0)).toBe('0.00%')
  })

  it('returns em dash for null, undefined, and NaN', () => {
    expect(formatPercentage(null)).toBe('—')
    expect(formatPercentage(undefined)).toBe('—')
    expect(formatPercentage(Number.NaN)).toBe('—')
  })
})
