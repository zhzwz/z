import { describe, expect, it } from 'vitest'
import {
  collectRuleBlocks,
  flattenRuleBlocks,
  isRuleLine,
  joinTextLines,
  sortRuleBlocks,
  splitTextLines,
} from './rule-blocks'

describe('isRuleLine', () => {
  it('treats empty and comment lines as non-rules', () => {
    expect(isRuleLine('')).toBe(false)
    expect(isRuleLine('   ')).toBe(false)
    expect(isRuleLine('# comment')).toBe(false)
  })

  it('treats pattern lines as rules', () => {
    expect(isRuleLine('node_modules/')).toBe(true)
    expect(isRuleLine('  *.log  ')).toBe(true)
  })
})

describe('splitTextLines / joinTextLines', () => {
  it('round-trips text with a final newline', () => {
    const text = 'a\nb\n'
    const split = splitTextLines(text)
    expect(split.hadFinalNewline).toBe(true)
    expect(split.lines).toEqual(['a', 'b'])
    expect(joinTextLines(split.lines, split.hadFinalNewline)).toBe(text)
  })

  it('round-trips text without a final newline', () => {
    const text = 'a\nb'
    const split = splitTextLines(text)
    expect(split.hadFinalNewline).toBe(false)
    expect(joinTextLines(split.lines, split.hadFinalNewline)).toBe(text)
  })

  it('strips carriage returns from lines', () => {
    const split = splitTextLines('a\r\nb\r\n')
    expect(split.lines).toEqual(['a', 'b'])
  })
})

describe('collectRuleBlocks', () => {
  it('attaches leading comments to the next rule line', () => {
    const { blocks, trailing } = collectRuleBlocks(
      ['# docs', '', '*.log', '# tail'],
      () => undefined,
    )
    expect(blocks).toEqual([
      { lead: ['# docs', ''], rule: '*.log', meta: undefined },
    ])
    expect(trailing).toEqual(['# tail'])
  })
})

describe('sortRuleBlocks', () => {
  it('keeps equal items stable', () => {
    const blocks = [
      { lead: [], rule: 'b', meta: 1 },
      { lead: [], rule: 'a', meta: 1 },
    ]
    const sorted = sortRuleBlocks(blocks, (a, b) => a.meta - b.meta)
    expect(sorted.map(block => block.rule)).toEqual(['b', 'a'])
  })
})

describe('flattenRuleBlocks', () => {
  it('preserves lead, rule, and trailing lines', () => {
    const lines = flattenRuleBlocks(
      [{ lead: ['# note'], rule: '*.log', meta: undefined }],
      ['tail'],
    )
    expect(lines).toEqual(['# note', '*.log', 'tail'])
  })
})
