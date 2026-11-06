import type { MockInstance } from 'vitest'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { findUnsafePathSegment, getPath, setPath } from './path'

const unsafeSegments = ['__proto__', 'constructor', 'prototype']

let warn: MockInstance<typeof console.warn>

beforeEach(() => {
  warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
})

afterEach(() => {
  warn.mockRestore()
})

describe('getPath', () => {
  it('reads a dotted path', () => {
    const data = {
      contact: { phone: '123' },
    }
    expect(getPath(data, 'contact.phone')).toBe('123')
    expect(warn).not.toHaveBeenCalled()
  })

  it('returns undefined for a missing path', () => {
    expect(getPath({}, 'contact.phone')).toBeUndefined()
    expect(getPath({ contact: null }, 'contact.phone')).toBeUndefined()
  })

  it('ignores inherited properties', () => {
    expect(getPath({}, 'toString')).toBeUndefined()
    expect(getPath({}, 'constructor.name')).toBeUndefined()
  })

  it.each(unsafeSegments)('does not read through %s', (segment) => {
    expect(getPath({}, `${segment}.read`)).toBeUndefined()
    expect(getPath({}, `a.${segment}.read`)).toBeUndefined()
  })
})

describe('setPath', () => {
  it('writes a dotted path', () => {
    const data = {
      contact: { phone: '123' },
    }
    setPath(data, 'contact.phone', '456')
    expect(data).toEqual({
      contact: { phone: '456' },
    })
    expect(warn).not.toHaveBeenCalled()
  })

  it('creates missing objects', () => {
    const data: Record<string, unknown> = {}
    setPath(data, 'contact.phone', '456')
    expect(data).toEqual({
      contact: { phone: '456' },
    })
  })

  it('replaces a primitive in the middle of the path', () => {
    const data: Record<string, unknown> = { contact: 'unknown' }
    setPath(data, 'contact.phone', '456')
    expect(data).toEqual({
      contact: { phone: '456' },
    })
  })

  it('writes an inherited name as an own property', () => {
    const data: Record<string, unknown> = {}
    setPath(data, 'toString', 'own')
    expect(Object.hasOwn(data, 'toString')).toBe(true)
    expect(getPath(data, 'toString')).toBe('own')
    expect(Object.hasOwn(Object.prototype, 'toString')).toBe(true)
  })

  it.each(unsafeSegments)('refuses to write through %s', (segment) => {
    const data: Record<string, unknown> = {}
    setPath(data, `${segment}.write`, 'yes')
    setPath(data, `a.${segment}.write`, 'yes')
    setPath(data, segment, 'yes')
    expect(data).toEqual({})
    expect(Object.hasOwn(Object.prototype, 'write')).toBe(false)
  })

  it('keeps Object.prototype clean after every attempt', () => {
    for (const segment of unsafeSegments) {
      setPath({}, `${segment}.clean`, 'yes')
      setPath({}, `a.${segment}.clean`, 'yes')
    }
    expect(Object.keys(Object.prototype)).toEqual([])
  })
})

describe('unsafe path warnings', () => {
  it('warns about the skipped write', () => {
    const data: Record<string, unknown> = {}
    setPath(data, 'warnWrite.__proto__.a', 'yes')
    expect(warn).toHaveBeenCalledOnce()
    const message = String(warn.mock.calls[0]![0])
    expect(message).toContain('setPath')
    expect(message).toContain('warnWrite.__proto__.a')
    expect(message).toContain('__proto__')
  })

  it('warns about the skipped read', () => {
    getPath({}, 'warnRead.constructor.a')
    expect(warn).toHaveBeenCalledOnce()
    const message = String(warn.mock.calls[0]![0])
    expect(message).toContain('getPath')
    expect(message).toContain('constructor')
  })

  it('warns once per path', () => {
    const data: Record<string, unknown> = {}
    setPath(data, 'warnOnce.__proto__.a', 'yes')
    setPath(data, 'warnOnce.__proto__.a', 'yes')
    getPath(data, 'warnOnce.__proto__.a')
    expect(warn).toHaveBeenCalledOnce()
  })

  it('warns about every distinct unsafe path', () => {
    setPath({}, 'warnA.__proto__.a', 'yes')
    setPath({}, 'warnB.prototype.a', 'yes')
    expect(warn).toHaveBeenCalledTimes(2)
  })
})

describe('findUnsafePathSegment', () => {
  it('finds the first unsafe segment', () => {
    expect(findUnsafePathSegment('a.__proto__.b')).toBe('__proto__')
    expect(findUnsafePathSegment('constructor.prototype')).toBe('constructor')
  })

  it('accepts safe paths', () => {
    expect(findUnsafePathSegment('contact.phone')).toBeUndefined()
    expect(findUnsafePathSegment('')).toBeUndefined()
  })
})
