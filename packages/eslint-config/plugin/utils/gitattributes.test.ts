import { describe, expect, it } from 'vitest'
import { categoryRank } from './gitattributes'

describe('categoryRank', () => {
  it('ranks text before binary', () => {
    expect(categoryRank(['text'])).toBeLessThan(categoryRank(['binary']))
  })

  it('treats text=eol=lf as text', () => {
    expect(categoryRank(['text=eol=lf'])).toBe(0)
  })

  it('ranks known categories before unknown attributes', () => {
    expect(categoryRank(['merge'])).toBe(4)
    expect(categoryRank(['export-ignore'])).toBeLessThan(categoryRank(['merge']))
  })
})
