import zhzwz from './packages/eslint-config/index.ts'

export default zhzwz({
  cspellConfigFile: new URL('./cspell.config.yaml', import.meta.url),
}).then(configs => [
  ...configs,
  {
    rules: {
      'no-console': 'off',
    },
  },
])
