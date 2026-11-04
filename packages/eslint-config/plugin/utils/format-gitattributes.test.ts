import { describe, expect, it } from 'vitest'
import { formatGitattributesLines } from './format-gitattributes'

describe('formatGitattributesLines', () => {
  it('sorts by category then pattern and aligns columns in one pass', () => {
    const input = `# comment
*.png binary
*.md   text
*.js text eol=lf
`
    expect(formatGitattributesLines(input, 4)).toBe(
      `*.js     text eol=lf
*.md     text
# comment
*.png    binary
`,
    )
  })

  it('is idempotent', () => {
    const input = `*.png binary
*.md text
`
    const once = formatGitattributesLines(input, 4)
    expect(formatGitattributesLines(once, 4)).toBe(once)
  })

  it('preserves trailing comments and missing final newline', () => {
    const input = `*.md    text
# tail`
    expect(formatGitattributesLines(input, 4)).toBe(input)
  })

  it('sorts and aligns quoted patterns with spaces', () => {
    const input = `*.png binary
"path with spaces" text
*.md text
`
    expect(formatGitattributesLines(input, 4)).toBe(
      `*.md                  text
"path with spaces"    text
*.png                 binary
`,
    )
  })

  it('moves macro definitions to the top when sorting rules', () => {
    const input = `*.png binary
[attr]binary -diff -merge -text
*.md text
`
    expect(formatGitattributesLines(input, 4)).toBe(
      `[attr]binary    -diff -merge -text
*.md            text
*.png           binary
`,
    )
  })

  it('sorts macro definitions by name at the top', () => {
    const input = `[attr]zebra -text
*.md text
[attr]alpha -diff
`
    expect(formatGitattributesLines(input, 4)).toBe(
      `[attr]alpha    -diff
[attr]zebra    -text
*.md           text
`,
    )
  })

  it('is idempotent for macro definitions', () => {
    const input = `*.png binary
[attr]binary -diff -merge -text
*.md text
`
    const once = formatGitattributesLines(input, 4)
    expect(formatGitattributesLines(once, 4)).toBe(once)
  })
})
