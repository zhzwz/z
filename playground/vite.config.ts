import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [
    vue(),
  ],
  resolve: {
    // playground、根包与 packages/components 各自声明了 vue，必须共用同一份运行时。
    dedupe: ['vue'],
  },
})
