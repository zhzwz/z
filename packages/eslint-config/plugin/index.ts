import type { ESLint } from 'eslint'
import { textLinesLanguage } from './languages/text-lines'
import { bracketSameLineRule } from './rules/bracket-same-line'
import { gitattributesFormatLinesRule } from './rules/gitattributes-format-lines'
import { gitignoreSortLinesRule } from './rules/gitignore-sort-lines'

const version = typeof __VERSION__ !== 'undefined' ? __VERSION__ : '0.0.0'

const plugin = {
  meta: { name: 'eslint-plugin-zhzwz', version },
  languages: {
    gitignore: textLinesLanguage,
    gitattributes: textLinesLanguage,
  },
  rules: {
    'gitignore-sort-lines': gitignoreSortLinesRule,
    'gitattributes-format-lines': gitattributesFormatLinesRule,
    'bracket-same-line': bracketSameLineRule,
  },
} satisfies ESLint.Plugin

export default plugin
