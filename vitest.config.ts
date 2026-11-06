import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    coverage: {
      provider: 'v8',
      include: ['components/**/*.{ts,vue}', 'shared/**/*.ts'],
      exclude: ['**/*.test.ts', 'components/**/index.ts'],
      reporter: ['text', 'html'],
    },
    projects: [
      {
        plugins: [
          vue(),
        ],
        test: {
          name: 'components',
          include: ['components/**/*.test.ts', 'shared/**/*.test.ts'],
          environment: 'happy-dom',
          setupFiles: ['./test/setup.ts'],
        },
      },
      {
        test: {
          name: 'dist',
          include: ['test/**/*.test.ts'],
        },
      },
    ],
  },
})
