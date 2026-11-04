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
  const { blocks, trailing } = collectRuleBlocks(lines, () => undefined)
  const sorted = sortRuleBlocks(blocks, (a, b) =>
    a.rule.trim().localeCompare(b.rule.trim(), 'en', { sensitivity: 'base' }))
  return joinTextLines(flattenRuleBlocks(sorted, trailing), hadFinalNewline)
}

export const gitignoreSortLinesRule = createWholeFileRule({
  description: '按字母顺序排列 .gitignore 每一行，注释跟随其下方第一条规则行',
  messageId: 'gitignoreUnsorted',
  message: '.gitignore 未按字母顺序排列，可通过 --fix 自动修复。',
  transform: text => sortGitignoreLines(text),
})
