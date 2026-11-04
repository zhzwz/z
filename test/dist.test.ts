import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import pkg from '../package.json' with { type: 'json' }

const distUrl = (fileName: string) => new URL(`../dist/${fileName}`, import.meta.url)
const readDist = (fileName: string) => readFileSync(distUrl(fileName), 'utf8')
const importDist = (fileName: string) => import(distUrl(fileName).href)

describe('dist', () => {
  it('exports components and version from the main entry', async () => {
    const entry = await importDist('index.js')
    expect(entry.version).toBe(pkg.version)
    expect(entry.ZButton).toMatchObject({ __name: 'ZButton' })
  })

  it('ships component types', () => {
    const types = readDist('index.d.ts')
    expect(types).toMatch(/export \{.*ZButton.*\}/)
    expect(types).toContain('ZButtonProps')
  })

  it('does not leak the private components package', () => {
    for (const fileName of ['index.js', 'index.d.ts']) {
      expect(readDist(fileName)).not.toContain('@zhzwz/components')
    }
  })

  it('emits component styles', () => {
    expect(readDist('style.css')).toContain('.z-button')
  })

  it('re-exports @zhzwz/eslint-config from the subpath', async () => {
    const [subpath, original] = await Promise.all([
      importDist('eslint-config.js'),
      import('@zhzwz/eslint-config'),
    ])
    expect(subpath.default).toBe(original.default)
  })
})
