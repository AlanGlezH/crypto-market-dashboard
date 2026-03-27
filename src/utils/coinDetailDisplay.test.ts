import { describe, expect, it } from 'vitest'
import { getCoinImageSrc } from './coinDetailDisplay'

describe('getCoinImageSrc', () => {
  it('returns string URLs as-is', () => {
    expect(getCoinImageSrc('https://example.com/coin.png')).toBe(
      'https://example.com/coin.png',
    )
  })

  it('prefers large, then small, then thumb', () => {
    expect(getCoinImageSrc({ large: 'L', small: 'S', thumb: 'T' })).toBe('L')
    expect(getCoinImageSrc({ small: 'S', thumb: 'T' })).toBe('S')
    expect(getCoinImageSrc({ thumb: 'T' })).toBe('T')
  })

  it('returns undefined when nothing usable', () => {
    expect(getCoinImageSrc(undefined)).toBeUndefined()
    expect(getCoinImageSrc({})).toBeUndefined()
  })
})
