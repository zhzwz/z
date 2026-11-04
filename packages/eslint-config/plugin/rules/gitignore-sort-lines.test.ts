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
      ],
      invalid: [
        {
          code: 'b\na\n',
          errors: [{ messageId: 'gitignoreUnsorted' }],
          output: 'a\nb\n',
        },
        {
          code: '# note\n\n*.tmp\n*.log\n',
          errors: [{ messageId: 'gitignoreUnsorted' }],
          output: '*.log\n# note\n\n*.tmp\n',
        },
      ],
    },
  )
})
