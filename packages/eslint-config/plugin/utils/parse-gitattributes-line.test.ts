import { describe, expect, it } from 'vitest'
import {
  formatGitattributesMacroDefinition,
  formatGitattributesPattern,
  formatGitattributesRuleLine,
  isGitattributesMacroDefinitionLine,
  parseGitattributesLine,
  parseGitattributesRuleLine,
} from './parse-gitattributes-line'

describe('isGitattributesMacroDefinitionLine', () => {
  it('detects [attr] macro definition lines', () => {
    expect(isGitattributesMacroDefinitionLine('[attr]binary -diff -merge -text')).toBe(true)
    expect(isGitattributesMacroDefinitionLine('  [attr]my-macro -text')).toBe(true)
    expect(isGitattributesMacroDefinitionLine('[diff] *.c')).toBe(false)
    expect(isGitattributesMacroDefinitionLine('*.md text')).toBe(false)
  })
})

describe('parseGitattributesLine', () => {
  it('parses macro definition with attributes', () => {
    expect(parseGitattributesLine('[attr]binary -diff -merge -text')).toEqual({
      kind: 'macro-definition',
      macroName: 'binary',
      pattern: '',
      rawPattern: '',
      attrs: ['-diff', '-merge', '-text'],
    })
  })

  it('parses macro definition without space after macro name', () => {
    expect(parseGitattributesLine('[attr]my-macro -text')).toEqual({
      kind: 'macro-definition',
      macroName: 'my-macro',
      pattern: '',
      rawPattern: '',
      attrs: ['-text'],
    })
  })

  it('treats invalid bracket lines as normal rules', () => {
    expect(parseGitattributesLine('[diff] *.c')).toEqual({
      kind: 'rule',
      macroName: '',
      pattern: '[diff]',
      rawPattern: '[diff]',
      attrs: ['*.c'],
    })
  })
})

describe('parseGitattributesRuleLine', () => {
  it('parses unquoted pattern and attributes', () => {
    expect(parseGitattributesRuleLine('*.md text eol=lf')).toEqual({
      pattern: '*.md',
      attrs: ['text', 'eol=lf'],
    })
  })

  it('parses quoted pattern with spaces', () => {
    expect(parseGitattributesRuleLine('"path with spaces" text')).toEqual({
      pattern: 'path with spaces',
      attrs: ['text'],
    })
  })

  it('parses escaped characters in quoted pattern', () => {
    expect(parseGitattributesRuleLine('"say \\"hi\\"" text')).toEqual({
      pattern: 'say "hi"',
      attrs: ['text'],
    })
  })

  it('parses backslash-escaped spaces in unquoted pattern', () => {
    expect(parseGitattributesRuleLine('path\\ with\\ spaces text')).toEqual({
      pattern: 'path with spaces',
      attrs: ['text'],
    })
  })

  it('parses macro definition lines', () => {
    expect(parseGitattributesRuleLine('[attr]binary -diff -text')).toEqual({
      pattern: '[attr]binary',
      attrs: ['-diff', '-text'],
    })
  })
})

describe('formatGitattributesRuleLine', () => {
  it('quotes patterns that contain spaces', () => {
    expect(formatGitattributesPattern('path with spaces')).toBe('"path with spaces"')
    expect(formatGitattributesRuleLine('path with spaces', ['text'])).toBe(
      '"path with spaces" text',
    )
  })

  it('pads pattern column while preserving quotes', () => {
    expect(formatGitattributesRuleLine('path with spaces', ['text'], 20)).toBe(
      '"path with spaces"  text',
    )
  })

  it('pads macro definition columns', () => {
    expect(formatGitattributesMacroDefinition({
      macroName: 'binary',
      attrs: ['-diff', '-text'],
    }, 16)).toBe('[attr]binary    -diff -text')
  })
})
