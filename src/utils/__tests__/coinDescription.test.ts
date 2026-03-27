import { describe, expect, it } from 'vitest'
import {
  buildDescriptionExcerpt,
  COIN_DESCRIPTION_EXCERPT_MAX,
  normalizeDescriptionEn,
} from '../coinDescription'

describe('normalizeDescriptionEn', () => {
  it('returns empty for undefined', () => {
    expect(normalizeDescriptionEn(undefined)).toBe('')
  })

  it('returns empty when trim leaves nothing', () => {
    expect(normalizeDescriptionEn('')).toBe('')
    expect(normalizeDescriptionEn('   ')).toBe('')
    expect(normalizeDescriptionEn(`  ${'\n'}\t  `)).toBe('')
  })

  it('trims edges only', () => {
    expect(normalizeDescriptionEn('  hello world  ')).toBe('hello world')
  })
})

describe('buildDescriptionExcerpt', () => {
  it('does not expand when at or under max', () => {
    const short = 'a'.repeat(100)
    const r = buildDescriptionExcerpt(short, 300)
    expect(r.full).toBe(short)
    expect(r.excerpt).toBe(short)
    expect(r.isExpandable).toBe(false)
  })

  it('truncates long text and marks expandable', () => {
    const long = 'word '.repeat(80).trim()
    const r = buildDescriptionExcerpt(long, COIN_DESCRIPTION_EXCERPT_MAX)
    expect(r.isExpandable).toBe(true)
    expect(r.full).toBe(long)
    expect(r.excerpt.length).toBeLessThanOrEqual(COIN_DESCRIPTION_EXCERPT_MAX)
    expect(long.startsWith(r.excerpt) || r.excerpt.length > 0).toBe(true)
  })
})
