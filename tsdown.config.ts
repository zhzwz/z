import { defineConfig } from 'tsdown'
import vue from 'unplugin-vue/rolldown'

export default defineConfig({
  entry: [
    'index.ts',
    'eslint-config.ts',
  ],
  format: 'esm',

  // 产物保持 dist/index.js，与 package.json 的 exports 对应。
  fixedExtension: false,

  // 浏览器和 Node 都能用。
  // @see https://tsdown.dev/options/platform
  platform: 'neutral',

  // @zhzwz/components 是私有包，必须打进产物；vue 作为 peer 保持外部。
  deps: {
    alwaysBundle: ['@zhzwz/components'],
  },

  plugins: [
    vue({ isProduction: true }),
  ],

  // @see https://tsdown.dev/recipes/vue-support
  dts: {
    vue: true,
    eager: true,
  },
})
