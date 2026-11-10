import { fileURLToPath } from 'node:url'
import mdx from '@astrojs/mdx'
import vue from '@astrojs/vue'
import { defineConfig } from 'astro/config'

const root = fileURLToPath(new URL('..', import.meta.url))
const src = fileURLToPath(new URL('./src', import.meta.url))

export default defineConfig({
  integrations: [
    vue(),
    mdx(),
  ],
  markdown: {
    // Markdown 里的代码围栏不经过 <Code>，它用这里的 shiki 配置，也要双主题才能跟随站点深浅色。
    shikiConfig: {
      themes: {
        dark: 'github-dark',
        light: 'github-light',
      },
    },
  },
  vite: {
    resolve: {
      alias: [
        // 演示代码按使用方的写法引入包名，实际指向仓库源码，改组件即生效，不必先构建。
        { find: /^@zhzwz\/z$/, replacement: `${root}/index.ts` },
        { find: /^@zhzwz\/z\/accent$/, replacement: `${root}/components/accent.ts` },
        { find: /^@zhzwz\/z\/components\/([^/]+)$/, replacement: `${root}/components/$1/index.ts` },
        { find: /^@\//, replacement: `${src}/` },
      ],
      // playground 与仓库根包各自声明了 vue，必须共用同一份运行时。
      dedupe: ['vue'],
    },
  },
})
