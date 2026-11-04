import { defineConfig } from 'tsdown'
import pkg from './package.json' with { type: 'json' }

export default defineConfig({
  entry: ['index.ts'],
  format: 'esm',
  dts: true,
  clean: true,
  deps: {
    neverBundle: [
      '@antfu/eslint-config',
      '@cspell/eslint-plugin',
    ],
  },
  inputOptions: {
    experimental: {
      attachDebugInfo: 'none',
    },
  },
  define: {
    __VERSION__: JSON.stringify(pkg.version),
  },
})
