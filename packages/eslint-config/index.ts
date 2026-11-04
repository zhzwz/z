import type { TypedFlatConfigItem } from '@antfu/eslint-config'
import type { EslintConfigZhzwzOptions } from './options'
import { antfu } from '@antfu/eslint-config'
import { baseConfig } from './configs/base'
import { createCspellConfig } from './configs/cspell'
import { GIT_META_FILES, gitattributesConfig, gitignoreConfig } from './configs/git-meta'
import { stylisticConfig } from './configs/stylistic'
import { hasUnoConfig } from './configs/unocss'
import { vscodeSettingsConfig } from './configs/vscode-settings'

export type { EslintConfigZhzwzOptions } from './options'

export default async function eslintConfigZhzwz(
  options: EslintConfigZhzwzOptions = {},
): Promise<TypedFlatConfigItem[]> {
  const composer = antfu(
    {
      ...baseConfig,
      unocss: options.unocss ?? hasUnoConfig(),
    },
    vscodeSettingsConfig,
    stylisticConfig,
    ...(await createCspellConfig(options)),
    gitignoreConfig,
    gitattributesConfig,
  )
  composer.setDefaultIgnores(prev => [
    ...prev,
    ...GIT_META_FILES,
  ])

  return composer
}
