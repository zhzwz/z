import { describe } from 'vitest'
import { createTextLinesRuleTester } from '../test/helpers'
import { gitignoreSortLinesRule } from './gitignore-sort-lines'

describe('gitignore-sort-lines', () => {
  createTextLinesRuleTester('zhzwz/gitignore').run(
    'gitignore-sort-lines',
    gitignoreSortLinesRule,
    {
      valid: [
        'node_modules/\n',
        '# docs\n\n*.log\n',
        'dist/*\n!dist/.gitkeep\n',
        '*.log\n!important.log\n',
      ],
      invalid: [
        {
          code: 'b\na\n',
          errors: [
            { messageId: 'gitignoreUnsorted' },
          ],
          output: 'a\nb\n',
        },
        {
          code: '# note\n\n*.tmp\n*.log\n',
          errors: [
            { messageId: 'gitignoreUnsorted' },
          ],
          output: '*.log\n# note\n\n*.tmp\n',
        },
        {
          code: 'b\na\n!a/keep\nd\nc\n',
          errors: [
            { messageId: 'gitignoreUnsorted' },
          ],
          output: 'a\nb\n!a/keep\nc\nd\n',
        },
      ],
    },
  )
})
