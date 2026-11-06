import { describe, expect, it } from 'vitest'
import { reactive, ref } from 'vue'
import { cloneData } from './clone'

describe('cloneData', () => {
  it('copies nested plain data without sharing references', () => {
    const source = {
      a: 1,
      zero: 0,
      text: '',
      list: [
        { b: 2 },
      ],
      nested: { c: 3 },
    }
    const copy = cloneData(source)
    expect(copy).toEqual(source)
    expect(copy).not.toBe(source)
    expect(copy.list).not.toBe(source.list)
    expect(copy.list[0]).not.toBe(source.list[0])
    expect(copy.nested).not.toBe(source.nested)
  })

  it('keeps Date, RegExp, Map and Set values', () => {
    const when = new Date('2026-01-01T00:00:00Z')
    const pattern = /a/gi
    const map = new Map([
      [
        'x',
        { y: 1 },
      ],
    ])
    const set = new Set(['x'])
    const copy = cloneData({ when, pattern, map, set })

    expect(copy.when).toBeInstanceOf(Date)
    expect(copy.when.getTime()).toBe(when.getTime())
    expect(copy.when).not.toBe(when)

    expect(copy.pattern).toBeInstanceOf(RegExp)
    expect(copy.pattern.flags).toBe('gi')
    expect(copy.pattern).not.toBe(pattern)

    expect(copy.map).toBeInstanceOf(Map)
    expect(copy.map.get('x')).toEqual({ y: 1 })
    expect(copy.map.get('x')).not.toBe(map.get('x'))
    expect(copy.map).not.toBe(map)

    expect(copy.set).toBeInstanceOf(Set)
    expect([...copy.set]).toEqual(['x'])
    expect(copy.set).not.toBe(set)
  })

  it('keeps typed arrays, ArrayBuffer and File', () => {
    const bytes = new Uint8Array([1, 2, 3])
    const buffer = new ArrayBuffer(2)
    const file = new File(['abc'], 'a.txt', { type: 'text/plain' })
    const copy = cloneData({ bytes, buffer, file })

    expect(copy.bytes).toBeInstanceOf(Uint8Array)
    expect([...copy.bytes]).toEqual([1, 2, 3])
    expect(copy.bytes).not.toBe(bytes)
    expect(copy.buffer).toBeInstanceOf(ArrayBuffer)
    expect(copy.buffer.byteLength).toBe(2)
    expect(copy.buffer).not.toBe(buffer)
    expect(copy.file).toBeInstanceOf(File)
    expect(copy.file.name).toBe('a.txt')
    expect(copy.file.type).toBe('text/plain')
  })

  it('keeps the prototype and own properties of a class instance', () => {
    class Money {
      cents = 100
      format() {
        return `${this.cents}`
      }
    }
    const money = new Money()
    const copy = cloneData({ money }).money

    expect(copy).toBeInstanceOf(Money)
    expect(copy.cents).toBe(100)
    expect(copy).not.toBe(money)
    expect(copy.format()).toBe('100')
  })

  it('copies circular references instead of overflowing the stack', () => {
    const source: Record<string, unknown> = { a: 1 }
    source.self = source
    source.list = [source]

    const copy = cloneData(source)
    expect(copy.self).toBe(copy)
    expect((copy.list as unknown[])[0]).toBe(copy)
  })

  it('copies a reactive model without leaking proxies', () => {
    const model = reactive({
      when: new Date('2026-01-01T00:00:00Z'),
      tags: new Set(['x']),
      nested: {
        list: [
          { a: 1 },
        ],
      },
    })
    const copy = cloneData(model)

    expect(copy.when).toBeInstanceOf(Date)
    expect(copy.tags).toBeInstanceOf(Set)
    expect(copy.nested).not.toBe(model.nested)
    expect(copy.nested.list[0]).not.toBe(model.nested.list[0])
  })

  it('copies the value of a ref model', () => {
    const model = ref({
      when: new Date('2026-01-01T00:00:00Z'),
    })
    expect(cloneData(model.value).when).toBeInstanceOf(Date)
  })

  it('keeps functions and symbols as they are', () => {
    const fn = () => 1
    const symbol = Symbol('s')
    const copy = cloneData({ fn, symbol })
    expect(copy.fn).toBe(fn)
    expect(copy.symbol).toBe(symbol)
  })
})
