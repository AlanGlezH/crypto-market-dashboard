import { describe, expect, it } from 'vitest'
import type { CoinMarket } from '../../api/types'
import { partitionFavorites } from '../partitionFavorites'

const A = { id: 'a' } as CoinMarket
const B = { id: 'b' } as CoinMarket
const C = { id: 'c' } as CoinMarket

describe('partitionFavorites', () => {
  it('returns same order when no favorites', () => {
    expect(partitionFavorites([A, B, C], new Set())).toEqual([A, B, C])
  })

  it('returns same order when all are favorites', () => {
    expect(partitionFavorites([A, B, C], new Set(['a', 'b', 'c']))).toEqual([
      A,
      B,
      C,
    ])
  })

  it('moves favorites first, preserves relative order in each group', () => {
    expect(partitionFavorites([A, B, C], new Set(['c', 'a']))).toEqual([A, C, B])
  })

  it('returns [] for empty input', () => {
    expect(partitionFavorites([], new Set(['a']))).toEqual([])
  })
})
