import type { TypedFlatConfigItem } from '@antfu/eslint-config'

/** 只排序顺序无关的数组；codeActionsOnSave、extraPaths 等数组的顺序即执行顺序或优先级 */
const ORDER_INSENSITIVE_ARRAYS = [
  'cSpell.flagWords',
  'cSpell.ignorePaths',
  'cSpell.ignoreWords',
  'cSpell.words',
  'eslint.validate',
]

const ORDER_INSENSITIVE_ARRAYS_PATTERN = `^(?:${ORDER_INSENSITIVE_ARRAYS
  .map(key => JSON.stringify([key]).replace(/[.[\]]/gu, '\\$&'))
  .join('|')})$`

export const vscodeSettingsConfig = {
  files: ['**/.vscode/settings.json'],
  rules: {
    'jsonc/sort-keys': ['error', 'asc'],
    'jsonc/array-bracket-newline': ['error', 'always'],
    'jsonc/array-element-newline': ['error', 'always'],
    'jsonc/sort-array-values': ['error', { pathPattern: ORDER_INSENSITIVE_ARRAYS_PATTERN, order: { type: 'asc' } }],
  },
} satisfies TypedFlatConfigItem
