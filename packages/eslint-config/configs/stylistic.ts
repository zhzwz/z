import type { TypedFlatConfigItem } from '@antfu/eslint-config'
import zhzwzPlugin from '../plugin'

export const stylisticConfig = {
  files: ['**/*.{js,ts,tsx,vue}'],
  plugins: { zhzwz: zhzwzPlugin },
  rules: {
    'zhzwz/bracket-same-line': 'warn',
  },
} satisfies TypedFlatConfigItem
