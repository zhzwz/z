import { describe } from 'vitest'
import { createTextLinesRuleTester } from '../test/helpers'
import { gitattributesFormatLinesRule } from './gitattributes-format-lines'

describe('gitattributes-format-lines', () => {
  createTextLinesRuleTester('zhzwz/gitattributes').run(
    'gitattributes-format-lines',
    gitattributesFormatLinesRule,
    {
      valid: [
        `*.js    text eol=lf
*.md    text
`,
      ],
      invalid: [
        {
          code: `*.png binary
*.md text
`,
          errors: [{ messageId: 'gitattributesUnformatted' }],
          output: `*.md     text
*.png    binary
`,
        },
        {
          code: `"path with spaces" text
*.md text
`,
          errors: [{ messageId: 'gitattributesUnformatted' }],
          output: `*.md                  text
"path with spaces"    text
`,
        },
        {
          code: `*.md text
`,
          options: [{ padding: 2 }],
          errors: [{ messageId: 'gitattributesUnformatted' }],
          output: `*.md  text
`,
        },
        {
          code: `*.png binary
[attr]binary -diff -merge -text
*.md text
`,
          errors: [{ messageId: 'gitattributesUnformatted' }],
          output: `[attr]binary    -diff -merge -text
*.md            text
*.png           binary
`,
        },
      ],
    },
  )
})
