import { describe, expect, it } from 'vitest'
import { toTextValue } from './text'

describe('toTextValue', () => {
  it('keeps a string as is, including the empty string', () => {
    expect(toTextValue('abc')).toBe('abc')
    expect(toTextValue('')).toBe('')
  })

  it('turns a finite number into text', () => {
    expect(toTextValue(42)).toBe('42')
    expect(toTextValue(0)).toBe('0')
  })

  it('rewrites everything else to null', () => {
    for (const value of [
      null,
      undefined,
      {},
      [],
      Number.NaN,
      Number.POSITIVE_INFINITY,
      true,
      Symbol('x'),
    ]) {
      expect(toTextValue(value)).toBeNull()
    }
  })
})
