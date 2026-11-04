# @zhzwz/eslint-config

基于 [@antfu/eslint-config](https://github.com/antfu/eslint-config) 的个人再封装的 ESLint Flat Config。

默认集成：

- Vue / Astro / UnoCSS
- CSS / HTML / Astro / Markdown
- **排序**：`.vscode/settings.json`
- **拼写**：cspell（可选，需传入 `cspellConfigFile`）

## 安装

```sh
pnpm add -D eslint @zhzwz/eslint-config
```

其他包管理器将 `pnpm add -D` 替换为对应命令即可（如 `npm install -D`、`yarn add -D`、`bun add -D`）。

## 使用

在项目根目录创建 `eslint.config.ts`：

```ts
import zhzwz from '@zhzwz/eslint-config'

export default zhzwz({
  // 可选：启用 cspell 拼写检查
  cspellConfigFile: new URL('./cspell.config.yaml', import.meta.url),
})
```

## 自定义规则

通过内置的 `zhzwz` 插件提供，均可自动修复：

| 规则                               | 作用                                                                                                                                                            |
| ---------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `zhzwz/gitignore-sort-lines`       | `.gitignore` 按字母顺序排序，注释跟随其下方第一条规则行；取反规则（`!`）与普通规则之间不交换先后                                                                |
| `zhzwz/gitattributes-format-lines` | `.gitattributes` 按「类别 → pattern」排序并对齐 pattern 列（列宽 = 最长 pattern + padding）；可能匹配同一文件且设置同一属性的规则保持原有先后，pattern 原样保留 |
| `zhzwz/bracket-same-line`          | 当 `{}` / `[]` 内容为单行时，禁止闭合括号前换行                                                                                                                 |
