import { describe, expect, it } from 'vitest'
import { affectedAttributes, categoryRank, patternsMayOverlap } from './gitattributes'

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

describe('affectedAttributes', () => {
  it('normalizes set, unset, unspecified and value forms', () => {
    expect(affectedAttributes(['text', '-diff', '!merge', 'eol=lf'], new Map()))
      .toEqual(new Set(['text', 'diff', 'merge']))
  })

  it('expands the builtin binary macro', () => {
    expect(affectedAttributes(['binary'], new Map()))
      .toEqual(new Set(['binary', 'diff', 'merge', 'text']))
  })

  it('expands nested macros defined in the file', () => {
    const macros = new Map([
      ['outer', ['inner', 'linguist-generated']],
      ['inner', ['-diff']],
    ])
    expect(affectedAttributes(['outer'], macros))
      .toEqual(new Set(['outer', 'inner', 'linguist-generated', 'diff']))
  })

  it('stops on recursive macros', () => {
    const macros = new Map([['loop', ['loop', '-text']]])
    expect(affectedAttributes(['loop'], macros)).toEqual(new Set(['loop', 'text']))
  })
})

describe('patternsMayOverlap', () => {
  it('treats different literal suffixes as disjoint', () => {
    expect(patternsMayOverlap('*.png', '*.md')).toBe(false)
    expect(patternsMayOverlap('assets/*.svg', '*.png')).toBe(false)
    expect(patternsMayOverlap('Makefile', '*.mk')).toBe(false)
  })

  it('treats patterns ending with a wildcard as overlapping everything', () => {
    expect(patternsMayOverlap('assets/**', '*.svg')).toBe(true)
    expect(patternsMayOverlap('*', 'README.md')).toBe(true)
  })

  it('treats nested suffixes as overlapping', () => {
    expect(patternsMayOverlap('*.d.ts', '*.ts')).toBe(true)
  })

  it('compares suffixes case-insensitively', () => {
    expect(patternsMayOverlap('*.PNG', '*.png')).toBe(true)
  })
})
