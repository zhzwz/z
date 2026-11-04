import { describe, expect, it } from 'vitest'
import { vscodeSettingsConfig } from './vscode-settings'

describe('vscodeSettingsConfig', () => {
  const [, { pathPattern }] = vscodeSettingsConfig.rules['jsonc/sort-array-values']
  const matches = (key: string) => new RegExp(pathPattern).test(JSON.stringify([key]))

  it('sorts order-insensitive arrays', () => {
    expect(matches('eslint.validate')).toBe(true)
    expect(matches('cSpell.words')).toBe(true)
  })

  it('keeps order-sensitive arrays untouched', () => {
    expect(matches('editor.codeActionsOnSave')).toBe(false)
    expect(matches('python.analysis.extraPaths')).toBe(false)
    expect(matches('eslint.validate.extra')).toBe(false)
  })
})
