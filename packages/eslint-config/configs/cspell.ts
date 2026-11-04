import type { TypedFlatConfigItem } from '@antfu/eslint-config'
import type { EslintConfigZhzwzOptions } from '../options'
import { fileURLToPath } from 'node:url'

const configFileSortConfig: TypedFlatConfigItem = {
  files: ['**/cspell.config.yaml'],
  rules: {
    'yaml/sort-sequence-values': [
      'error',
      { pathPattern: '.*', order: { type: 'asc' } },
    ],
    'yaml/sort-keys': ['error', 'asc'],
  },
}

export async function createCspellConfig(
  options: Pick<EslintConfigZhzwzOptions, 'cspellConfigFile'>,
): Promise<TypedFlatConfigItem[]> {
  const { cspellConfigFile } = options

  if (!cspellConfigFile) {
    return [configFileSortConfig]
  }

  const cspellPlugin = (await import('@cspell/eslint-plugin')).default

  return [
    {
      plugins: { '@cspell': cspellPlugin },
      rules: {
        '@cspell/spellchecker': ['warn', {
          configFile: typeof cspellConfigFile === 'string'
            ? cspellConfigFile
            : fileURLToPath(cspellConfigFile),
          autoFix: true,
        }],
      },
    },
    configFileSortConfig,
  ]
}
