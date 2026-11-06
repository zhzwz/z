import { describe, expect, it } from 'vitest'
import { validateZnFormSchema } from './schema'

describe('validateZnFormSchema', () => {
  it('accepts a dotted path', () => {
    expect(validateZnFormSchema({
      fields: [
        { component: 'ZnInput', path: 'contact.phone' },
      ],
    })).toEqual([])
    expect(validateZnFormSchema({
      fields: [
        {
          component: 'ZnDateRange',
          path: { start: 'a.start', end: 'a.end' },
        },
      ],
    })).toEqual([])
  })

  it.each(['__proto__', 'constructor', 'prototype'])('rejects %s in a string path', (segment) => {
    expect(validateZnFormSchema({
      fields: [
        { component: 'ZnInput', path: `${segment}.polluted` },
      ],
    })).toEqual([
      { index: 0, message: `path 不能包含 ${segment}` },
    ])
  })

  it.each(['__proto__', 'constructor', 'prototype'])('rejects %s in a named path', (segment) => {
    expect(validateZnFormSchema({
      fields: [
        {
          component: 'ZnDateRange',
          path: { start: 'startDate', end: `${segment}.polluted` },
        },
      ],
    })).toEqual([
      { index: 0, message: `path 不能包含 ${segment}` },
    ])
  })

  it('reports the unknown component before the unsafe path', () => {
    expect(validateZnFormSchema({
      fields: [
        { component: 'Unknown', path: '__proto__.polluted' },
      ],
    })).toEqual([
      { index: 0, message: '未知组件 Unknown' },
    ])
  })

  it.each([0, -2, 1.5, Number.NaN])('rejects cols %s', (cols) => {
    expect(validateZnFormSchema({
      cols,
      fields: [
        { component: 'ZnInput', path: 'name' },
      ],
    })).toEqual([
      { message: 'cols 应为正整数' },
    ])
  })

  it.each([0, -2, 2.5])('rejects span %s', (span) => {
    expect(validateZnFormSchema({
      cols: 2,
      fields: [
        { component: 'ZnInput', path: 'name', span },
      ],
    })).toEqual([
      { index: 0, message: 'span 应为正整数' },
    ])
  })

  it('accepts positive integer cols and span', () => {
    expect(validateZnFormSchema({
      cols: 3,
      fields: [
        { component: 'ZnInput', path: 'name', span: 2 },
      ],
    })).toEqual([])
  })
})
