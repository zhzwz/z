import type { TypedFlatConfigItem } from '@antfu/eslint-config'

export const vscodeSettingsConfig = {
  files: ['**/.vscode/settings.json'],
  rules: {
    'jsonc/sort-keys': ['error', 'asc'],
    'jsonc/array-bracket-newline': ['error', 'always'],
    'jsonc/array-element-newline': ['error', 'always'],
    'jsonc/sort-array-values': ['error', { pathPattern: '.*', order: { type: 'asc' } }],
  },
} satisfies TypedFlatConfigItem
