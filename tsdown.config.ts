import { defineConfig } from 'tsdown'

export default defineConfig({
  entry: [
    'index.ts',
  ],
  format: 'esm',

  // 产物保持 dist/index.js，与 package.json 的 exports 对应。
  fixedExtension: false,

  // 浏览器和 Node 都能用。
  // @see https://tsdown.dev/options/platform
  platform: 'neutral',

  dts: true,
})
