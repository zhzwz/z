import { chmodSync, mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { hasUnoConfig } from './unocss'

describe('hasUnoConfig', () => {
  let root: string

  beforeEach(() => {
    root = mkdtempSync(join(tmpdir(), 'eslint-config-unocss-'))
  })

  afterEach(() => {
    rmSync(root, { recursive: true, force: true })
  })

  it('returns false without a config file', () => {
    expect(hasUnoConfig(root)).toBe(false)
  })

  it.each([
    'uno.config.ts',
    'unocss.config.mjs',
    'uno.config.json',
    'uno.config',
  ])('detects %s', (fileName) => {
    writeFileSync(join(root, fileName), '{}')
    expect(hasUnoConfig(root)).toBe(true)
  })

  it('ignores a directory with a config file name', () => {
    mkdirSync(join(root, 'uno.config'))
    expect(hasUnoConfig(root)).toBe(false)
  })

  it('detects a config in an ancestor directory', () => {
    const packageDirectory = join(root, 'packages', 'web')
    mkdirSync(packageDirectory, { recursive: true })
    writeFileSync(join(root, 'uno.config.ts'), 'export default {}')
    expect(hasUnoConfig(packageDirectory)).toBe(true)
  })

  it('skips inaccessible directories and keeps searching upward', () => {
    const lockedDirectory = join(root, 'locked')
    const innerDirectory = join(lockedDirectory, 'inner')
    mkdirSync(innerDirectory, { recursive: true })
    writeFileSync(join(root, 'uno.config.ts'), 'export default {}')
    chmodSync(lockedDirectory, 0o000)
    try {
      expect(hasUnoConfig(innerDirectory)).toBe(true)
    } finally {
      chmodSync(lockedDirectory, 0o755)
    }
  })

  it('ignores configs in descendant directories', () => {
    const packageDirectory = join(root, 'packages', 'web')
    mkdirSync(packageDirectory, { recursive: true })
    writeFileSync(join(packageDirectory, 'uno.config.ts'), 'export default {}')
    expect(hasUnoConfig(root)).toBe(false)
  })
})
