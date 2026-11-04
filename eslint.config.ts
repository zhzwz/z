import zhzwz from './packages/eslint-config'

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
