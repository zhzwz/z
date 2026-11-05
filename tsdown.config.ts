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
    fullySpecifyDeclarationImports(),
  ],

  // @see https://tsdown.dev/recipes/vue-support
  dts: {
    vue: true,
    eager: true,
  },

  unbundle: true,

  // unbundle 默认按组件拆分 CSS，但组件 JS 不会引入拆出的文件，所以合并为 dist/style.css，由使用方或 resolver 引入。
  css: {
    splitting: false,
  },
})
