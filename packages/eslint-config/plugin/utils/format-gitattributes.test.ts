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

  it('keeps the order of overlapping rules that set the same attribute', () => {
    const input = `assets/** binary
assets/*.svg text
`
    expect(formatGitattributesLines(input, 4)).toBe(
      `assets/**       binary
assets/*.svg    text
`,
    )
  })

  it('expands macros defined in the file when checking overlaps', () => {
    const input = `[attr]generated linguist-generated -diff
dist/** generated
dist/*.js diff
`
    expect(formatGitattributesLines(input, 4)).toBe(
      `[attr]generated    linguist-generated -diff
dist/**            generated
dist/*.js          diff
`,
    )
  })

  it('still sorts overlapping rules that set different attributes', () => {
    const input = `docs/** export-ignore
docs/*.md text
`
    expect(formatGitattributesLines(input, 4)).toBe(
      `docs/*.md    text
docs/**      export-ignore
`,
    )
  })

  it('keeps escaped patterns verbatim', () => {
    const input = `\\#notes.txt text
\\!important.txt text
path\\ with\\ spaces text
`
    expect(formatGitattributesLines(input, 4)).toBe(
      `\\!important.txt       text
\\#notes.txt           text
path\\ with\\ spaces    text
`,
    )
  })

  it('is idempotent when overlapping rules keep their order', () => {
    const input = `*.png binary
assets/** binary
*.md text
assets/*.svg text
`
    const once = formatGitattributesLines(input, 4)
    expect(formatGitattributesLines(once, 4)).toBe(once)
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
