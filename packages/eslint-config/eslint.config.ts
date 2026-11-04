import zhzwz from '.'

export default zhzwz({
  cspellConfigFile: new URL('./cspell.config.yaml', import.meta.url),
})
