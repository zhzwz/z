import { describe, expect, it } from 'vitest'
import eslintConfigZhzwz from './index'

async function hasUnocssRules(options: Parameters<typeof eslintConfigZhzwz>[0]) {
  const configs = await eslintConfigZhzwz(options)
  return configs.some(config => Object.keys(config.rules ?? {}).some(rule => rule.startsWith('unocss/')))
}

describe('eslintConfigZhzwz', () => {
  it('enables UnoCSS rules when unocss is true', async () => {
    expect(await hasUnocssRules({ unocss: true })).toBe(true)
  })

  it('disables UnoCSS rules when unocss is false', async () => {
    expect(await hasUnocssRules({ unocss: false })).toBe(false)
  })
})
