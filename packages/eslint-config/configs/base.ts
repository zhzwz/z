import type { OptionsConfig, TypedFlatConfigItem } from '@antfu/eslint-config'

export type AntfuBaseConfig = OptionsConfig & Omit<TypedFlatConfigItem, 'files' | 'ignores'>

export const baseConfig = {
  unocss: true,
  vue: true,
  astro: true,
  rules: {
    curly: ['error', 'all'],
    'no-irregular-whitespace': 'off',
    'no-console': ['warn', { allow: ['warn', 'error'] }],
    'vue/component-name-in-template-casing': ['error', 'PascalCase', {
      registeredComponentsOnly: false,
      ignores: [],
    }],
    'vue/singleline-html-element-content-newline': 'off',
    'vue/attributes-order': ['warn', { alphabetical: true }],
    'perfectionist/sort-object-types': ['warn', { type: 'alphabetical', order: 'asc' }],
    'perfectionist/sort-interfaces': ['warn', { type: 'alphabetical', order: 'asc' }],
    'style/brace-style': ['error', '1tbs'],
    'style/quote-props': ['error', 'as-needed', { unnecessary: true, numbers: true }],
    'jsonc/comma-dangle': 'off',
  },
  formatters: {
    css: true,
    html: true,
    astro: true,
    markdown: 'prettier' as const,
  },
} satisfies AntfuBaseConfig
