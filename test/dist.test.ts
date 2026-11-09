import { execFile } from 'node:child_process'
import { readdirSync, readFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { fileURLToPath } from 'node:url'
import { promisify } from 'node:util'
import { describe, expect, it } from 'vitest'
import pkg from '../package.json' with { type: 'json' }

const distUrl = (fileName: string) => new URL(`../dist/${fileName}`, import.meta.url)
const readDist = (fileName: string) => readFileSync(distUrl(fileName), 'utf8')
const importDist = (fileName: string) => import(distUrl(fileName).href)

// 每个组件允许依赖的外部包，也是 README 中"需要安装的依赖"的依据。
const componentDependencies: Record<string, string[]> = {
  'z-button': ['vue'],
  'z-flex': ['vue'],
  'z-icon': ['@iconify/vue', 'vue'],
  'zn-button': ['@iconify/vue', 'naive-ui', 'vue'],
  'zn-checkbox': ['naive-ui', 'vue'],
  'zn-checkbox-group': ['naive-ui', 'vue'],
  'zn-config-provider': ['naive-ui', 'vue'],
  'zn-date': ['date-fns', 'naive-ui', 'vue'],
  'zn-date-range': ['date-fns', 'naive-ui', 'vue'],
  'zn-date-time': ['date-fns', 'naive-ui', 'vue'],
  'zn-form': [
    '@iconify/vue',
    'date-fns',
    'naive-ui',
    'vue',
  ],
  'zn-form-field': [
    '@iconify/vue',
    'date-fns',
    'naive-ui',
    'vue',
  ],
  'zn-form-item': ['naive-ui', 'vue'],
  'zn-input': ['naive-ui', 'vue'],
  'zn-input-number': ['naive-ui', 'vue'],
  'zn-radio-group': ['naive-ui', 'vue'],
  'zn-scrollbar': ['naive-ui', 'vue'],
  'zn-select': ['@iconify/vue', 'naive-ui', 'vue'],
  'zn-select-multi': ['@iconify/vue', 'naive-ui', 'vue'],
  'zn-switch': ['naive-ui', 'vue'],
  'zn-textarea': ['naive-ui', 'vue'],
}

const componentDirs = readdirSync(distUrl('components/'), { withFileTypes: true })
  .filter(entry => entry.isDirectory())
  .map(entry => entry.name)

const toComponentName = (dir: string) => dir.replace(/(?:^|-)([a-z])/g, (_, char: string) => char.toUpperCase())

function packageName(specifier: string) {
  const [scopeOrName, name] = specifier.split('/')
  return scopeOrName!.startsWith('@')
    ? `${scopeOrName}/${name}`
    : scopeOrName!
}

function collectExternalImports(url: URL, seen = new Set<string>(), externals = new Set<string>()) {
  if (seen.has(url.href)) {
    return externals
  }
  seen.add(url.href)
  const code = readFileSync(url, 'utf8')
  for (const [, specifier] of code.matchAll(/(?:from|import)\s*"([^"]+)"/g)) {
    if (specifier!.startsWith('.')) {
      collectExternalImports(new URL(specifier!, url), seen, externals)
    } else {
      externals.add(packageName(specifier!))
    }
  }
  return externals
}

describe('dist', () => {
  it('exports only the version from the main entry', async () => {
    const entry = await importDist('index.js')
    expect(Object.keys(entry)).toEqual(['version'])
    expect(entry.version).toBe(pkg.version)
  })

  it('lists the dependencies of every built component', () => {
    expect(componentDirs.toSorted()).toEqual(Object.keys(componentDependencies).toSorted())
  })

  describe.each(componentDirs)('components/%s', (dir) => {
    const name = toComponentName(dir)

    it('is importable through the package exports', async () => {
      const entry = await import(`@zhzwz/z/components/${dir}`)
      expect(entry[name]).toMatchObject({ __name: name })
    })

    it('ships types', () => {
      const types = readDist(`components/${dir}/index.d.ts`)
      expect(types).toContain(name)
      expect(types).toContain(`${name}Props`)
    })

    it('imports only its declared dependencies', () => {
      const externals = collectExternalImports(distUrl(`components/${dir}/index.js`))
      expect([...externals].toSorted()).toEqual(componentDependencies[dir])
    })

    it('is resolved by ZResolver', async () => {
      const { ZResolver } = await importDist('resolver.js')
      expect(ZResolver().resolve(name)).toEqual({
        name,
        from: `@zhzwz/z/components/${dir}`,
        sideEffects: '@zhzwz/z/style.css',
      })
    })
  })

  it('leaves unknown components and styles to the caller', async () => {
    const { ZResolver } = await importDist('resolver.js')
    expect(ZResolver().resolve('ZUnknown')).toBeUndefined()
    expect(ZResolver().resolve('NButton')).toBeUndefined()
    expect(ZResolver({ importStyle: false }).resolve('ZnButton')).toMatchObject({ sideEffects: undefined })
  })

  it('emits component styles', () => {
    const css = readDist('style.css')
    for (const className of [
      '.z-button',
      '.z-flex',
      '.z-icon',
      '.zn-button--icon-only',
      '.zn-config-provider',
      '.zn-date-range__clear',
      '.zn-form',
      '.zn-form-item__help',
    ]) {
      expect(css).toContain(className)
    }
  })

  describe('types for consumers', () => {
    const consumerUrl = new URL('consumer/', import.meta.url)

    it('covers every component', () => {
      const consumer = readFileSync(new URL('index.ts', consumerUrl), 'utf8')
      for (const dir of componentDirs) {
        expect(consumer).toContain(`'@zhzwz/z/components/${dir}'`)
      }
    })

    // 不开 skipLibCheck，声明文件里引用的每个类型都要能解析。
    it.each([
      ['nodenext', 'nodenext'],
      ['esnext', 'bundler'],
    ])('type-checks with module %s and moduleResolution %s', async (module, moduleResolution) => {
      const tsc = createRequire(import.meta.url).resolve('typescript/bin/tsc')
      const args = [
        tsc,
        '-p',
        fileURLToPath(consumerUrl),
        '--module',
        module,
        '--moduleResolution',
        moduleResolution,
      ]
      const errors = await promisify(execFile)(process.execPath, args)
        .then(() => '', (error: { stdout: string }) => error.stdout)
      expect(errors).toBe('')
    }, 30_000)
  })

  it('re-exports @zhzwz/eslint-config from the subpath', async () => {
    const [subpath, original] = await Promise.all([
      importDist('eslint-config.js'),
      import('@zhzwz/eslint-config'),
    ])
    expect(subpath.default).toBe(original.default)
  })
})
