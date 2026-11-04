export interface EslintConfigZhzwzOptions {
  /** cspell 配置文件路径；未提供时不启用拼写检查 */
  cspellConfigFile?: string | URL
  /** 启用 UnoCSS 规则；未提供时按当前工作目录下是否存在 UnoCSS 配置文件判断 */
  unocss?: boolean
}
