import type { TypedFlatConfigItem } from '@antfu/eslint-config'
import zhzwzPlugin from '../plugin'

const GITIGNORE_GLOB = '**/.gitignore'
const GITATTRIBUTES_GLOB = '**/.gitattributes'

export const GIT_META_FILES = [GITIGNORE_GLOB, GITATTRIBUTES_GLOB] as const

export const gitignoreConfig = {
  files: [GITIGNORE_GLOB],
  plugins: { zhzwz: zhzwzPlugin },
  language: 'zhzwz/gitignore',
  rules: {
    'zhzwz/gitignore-sort-lines': 'error',
  },
} satisfies TypedFlatConfigItem

export const gitattributesConfig = {
  files: [GITATTRIBUTES_GLOB],
  plugins: { zhzwz: zhzwzPlugin },
  language: 'zhzwz/gitattributes',
  rules: {
    'zhzwz/gitattributes-format-lines': [
      'error',
      { padding: 4 },
    ],
  },
} satisfies TypedFlatConfigItem
