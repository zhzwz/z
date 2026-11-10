import type { Rolldown } from 'tsdown'
import { existsSync, readFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { dirname, join } from 'node:path'
import { defineConfig } from 'tsdown'
import vue from 'unplugin-vue/rolldown'

const require = createRequire(import.meta.url)

function resolveDeclarationSubpath(pkg: string, subpath: string) {
  if (/\.[cm]?js$/.test(subpath)) {
    return null
  }
  let manifest: string
  try {
    manifest = require.resolve(`${pkg}/package.json`)
  } catch {
    return null
  }
  if (JSON.parse(readFileSync(manifest, 'utf8')).exports) {
    return null
  }
  const root = dirname(manifest)
  if (existsSync(join(root, `${subpath}.d.ts`))) {
    return `${subpath}.js`
  }
  if (existsSync(join(root, subpath, 'index.d.ts'))) {
    return `${subpath}/index.js`
  }
  return null
}

function withoutLeadingBlankLines(source: string | Uint8Array) {
  if (typeof source !== 'string') {
    return source
  }
  return source.replace(/^(?:\r?\n)+/, '')
}

// 样式模块的产物名带着 Vue 编译器的查询串。收成组件名，例如 ZIcon.css。
function nameComponentCss(): Rolldown.Plugin {
  return {
    name: 'name-component-css',
    generateBundle: {
      order: 'post',
      handler(_options, bundle) {
        const renames = new Map<string, string>()
        const taken = new Set<string>()
        for (const fileName of Object.keys(bundle)) {
          const match = /^(.*\/)?([^/]+)\.vue_vue_type_style_index_(\d+)_lang\.css$/.exec(fileName)
          if (!match) {
            continue
          }
          const [, dir = '', component, index] = match
          let suffix = ''
          if (index !== '0') {
            suffix = `-${index}`
          }
          const cssName = `${dir}${component}${suffix}.css`
          if (bundle[cssName] || taken.has(cssName)) {
            this.error(`CSS 文件名冲突：${cssName}`)
          }
          taken.add(cssName)
          renames.set(fileName, cssName)
        }
        for (const [from, to] of renames) {
          const asset = bundle[from]
          if (!asset || asset.type !== 'asset') {
            continue
          }
          this.emitFile({
            type: 'asset',
            fileName: to,
            source: withoutLeadingBlankLines(asset.source),
          })
          delete bundle[from]
        }
        for (const chunk of Object.values(bundle)) {
          if (chunk.type !== 'chunk') {
            continue
          }
          for (const [from, to] of renames) {
            chunk.code = chunk.code.replaceAll(
              from.slice(from.lastIndexOf('/') + 1),
              to.slice(to.lastIndexOf('/') + 1),
            )
          }
        }
      },
    },
  }
}

// 声明文件里推断出的类型可能引用依赖的内部路径（如 naive-ui/es/_utils）。
// 依赖没有 exports 时，moduleResolution: nodenext 要求深层导入写到具体文件。
function fullySpecifyDeclarationImports(): Rolldown.Plugin {
  return {
    name: 'fully-specify-declaration-imports',
    renderChunk(code, chunk) {
      if (!chunk.fileName.endsWith('.d.ts')) {
        return null
      }
      return code.replace(
        /(from\s+|import\()(["'])((?:@[^/"']+\/)?[^./"'][^/"']*)\/([^"']+)\2/g,
        (match, prefix: string, quote: string, pkg: string, subpath: string) => {
          const resolved = resolveDeclarationSubpath(pkg, subpath)
          return resolved
            ? `${prefix}${quote}${pkg}/${resolved}${quote}`
            : match
        },
      )
    },
  }
}

export default defineConfig({
  // 每个组件单独作为入口，使用方只需安装所用组件的依赖。
  entry: [
    'index.ts',
    'eslint-config.ts',
    'components/accent.ts',
    'resolver.ts',
    'components/*/index.ts',
  ],
  format: 'esm',

  // 产物保持 dist/index.js、dist/components/<组件>/index.js，与 package.json 的 exports 对应。
  fixedExtension: false,

  // 浏览器和 Node 都能用。
  // @see https://tsdown.dev/options/platform
  platform: 'neutral',

  plugins: [
    vue({ isProduction: true }),
    nameComponentCss(),
    fullySpecifyDeclarationImports(),
  ],

  // @see https://tsdown.dev/recipes/vue-support
  dts: {
    vue: true,
    eager: true,
  },

  unbundle: true,

  // 拆到组件自己的 CSS，并在组件 JS 里引入。使用方只会带上所用组件及其依赖组件的样式。
  css: {
    splitting: true,
    inject: true,
  },
})
