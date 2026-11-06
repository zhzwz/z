# @zhzwz/z

```bash
pnpm add @zhzwz/z
pnpm add -D @zhzwz/eslint-config
```

## Vue 组件

推荐配合 [unplugin-vue-components](https://github.com/unplugin/unplugin-vue-components) 使用，在模板中直接写组件名，组件与样式自动按需引入：

```ts
import { ZResolver } from '@zhzwz/z/resolver'
import Components from 'unplugin-vue-components/vite'

export default defineConfig({
  plugins: [
    Components({
      resolvers: [
        ZResolver()
      ],
    }),
  ],
})
```

自行引入样式时，传 `ZResolver({ importStyle: false })`。

也可以手动导入。每个组件是单独的入口，没有汇总导出所有组件的入口：

```ts
import { ZButton } from '@zhzwz/z/components/z-button'
import { ZnButton } from '@zhzwz/z/components/zn-button'
import '@zhzwz/z/style.css'
```

每个组件只依赖下表中的库，只需安装所用组件的依赖。`Zn*` 组件是对 [naive-ui](https://www.naiveui.com) 的二次封装。

| 组件                           | 需要安装的依赖                    |
| ------------------------------ | --------------------------------- |
| `ZButton`、`ZFlex`、`ZFlexCol` | `vue`                             |
| `ZIcon`                        | `vue`、`@iconify/vue`             |
| `ZnButton`                     | `vue`、`naive-ui`、`@iconify/vue` |

### 图标

`ZIcon` 和 `ZnButton` 的 `icon` 接受三种值：

```vue
<ZIcon icon="ic:round-add" />          <!-- iconify 图标名，运行时从 api.iconify.design 加载 -->

<ZIcon :icon="roundAdd" />             <!-- iconify 图标数据，不联网 -->

<ZIcon :icon="IconAdd" />              <!-- 图标组件，如 unplugin-icons 生成的组件 -->
```

无法访问外网时，用 `@iconify/vue` 的 `addCollection` 预先注册图标集，之后按名字使用即可。`icon` 为空时不渲染。

图标默认是装饰性的，读屏软件会跳过；单独表达含义的图标需要 `aria-label`。只有图标、没有文字的按钮必须提供 `aria-label`、`aria-labelledby` 或 `title`，否则开发环境会给出警告：

```vue
<ZnButton icon="ic:round-search" aria-label="搜索" />

<ZIcon icon="ic:round-favorite" aria-label="已收藏" />
```

## ESLint 配置

`@zhzwz/z/eslint-config` 等同于 [@zhzwz/eslint-config](./packages/eslint-config)，两者任选其一：

```ts
import zhzwz from '@zhzwz/z/eslint-config'

export default zhzwz()
```

## 开发

```bash
pnpm dev         # 启动文档站，演示各组件的用法
pnpm typecheck
pnpm lint
pnpm test        # 包含构建产物的冒烟测试
```

组件文档在 `playground/`，用 Astro 生成，开发约定见 [`playground/AGENTS.md`](./playground/AGENTS.md)。

## 发布

各包版本独立，只升有改动的包。提交并推送后，为本次升级的每个包推送 tag（`<包目录名>@v<版本>`，根包为 `z`，如 `z@v0.2.0`、`eslint-config@v0.4.0`），`.github/workflows/publish.yaml` 会在同一次运行里按依赖顺序发布所有版本尚未在 npm 上的包。

子包改了代码却没升版本时，发布会被拒绝。

## Packages

### [@zhzwz/eslint-config](./packages/eslint-config)

## CSpell Config

根目录的 [`cspell.config.yaml`](./cspell.config.yaml) 可被其他项目远程引用，在其 CSpell 配置中 import 即可：

```yaml
ignoreWords:
  - word

import:
  - https://raw.githubusercontent.com/zhzwz/z/main/cspell.config.yaml

words:
  - word
```

引用的是 `main` 分支上的版本，本仓库推送后需等几分钟 CDN 缓存刷新才会生效。
