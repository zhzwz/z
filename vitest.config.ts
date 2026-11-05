import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    projects: [
      {
        plugins: [
          vue(),
        ],
        test: {
          name: 'components',
          include: ['components/**/*.test.ts'],
          environment: 'happy-dom',
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
