import { describe, expect, it } from 'vitest'
import { findBracketPairs } from './bracket-lexer'

function pairRanges(text: string) {
  return findBracketPairs(text).map(pair => [pair.open, pair.close])
}

describe('findBracketPairs', () => {
  it('finds object literal brackets', () => {
    expect(pairRanges('{ foo: 1 }')).toEqual([[0, 9]])
  })

  it('ignores brackets inside double-quoted strings', () => {
    expect(pairRanges('"{ not a bracket }"')).toEqual([])
  })

  it('ignores brackets inside template literal expressions', () => {
    const text = `const x = { foo: \`bar \${ { a: 1 } }\` }`
    const pairs = findBracketPairs(text)
    expect(pairs).toHaveLength(1)
    expect(pairs[0]?.openChar).toBe('{')
    expect(text.slice(pairs[0]!.open, pairs[0]!.close + 1)).toBe(`{ foo: \`bar \${ { a: 1 } }\` }`)
  })

  it('ignores brackets inside nested template literals', () => {
    const text = `const x = { tpl: \`\${\`inner \${[1, 2]}\`}\` }`
    const pairs = findBracketPairs(text)
    expect(pairs).toHaveLength(1)
    expect(text.slice(pairs[0]!.open, pairs[0]!.close + 1)).toBe(`{ tpl: \`\${\`inner \${[1, 2]}\`}\` }`)
  })

  it('still finds array brackets outside template literals', () => {
    expect(pairRanges('const xs = [1, 2\n]')).toEqual([[11, 17]])
  })
})
