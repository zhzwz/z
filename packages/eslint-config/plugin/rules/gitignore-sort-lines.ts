import {
  collectRuleBlocks,
  flattenRuleBlocks,
  joinTextLines,
  sortRuleBlocks,
  splitTextLines,
} from '../utils/rule-blocks'
import { createWholeFileRule } from '../utils/whole-file-rule'

function sortGitignoreLines(text: string): string {
  const { hadFinalNewline, lines } = splitTextLines(text)
  const { blocks, trailing } = collectRuleBlocks(lines, line => line.trim().startsWith('!'))
  const sorted = sortRuleBlocks(
    blocks,
    (a, b) => a.rule.trim().localeCompare(b.rule.trim(), 'en', { sensitivity: 'base' }),
    (a, b) => a.meta !== b.meta,
  )
  return joinTextLines(flattenRuleBlocks(sorted, trailing), hadFinalNewline)
}

export const gitignoreSortLinesRule = createWholeFileRule({
  description: '按字母顺序排列 .gitignore 每一行，注释跟随其下方第一条规则行；取反规则与普通规则之间保持原有先后',
  messageId: 'gitignoreUnsorted',
  message: '.gitignore 未按字母顺序排列，可通过 --fix 自动修复。',
  transform: text => sortGitignoreLines(text),
})
