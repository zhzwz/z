# @zhzwz/z

```bash
pnpm add @zhzwz/z
pnpm add -D @zhzwz/eslint-config
```

## Vue 组件

```ts
import { ZButton } from '@zhzwz/z'
import '@zhzwz/z/style.css'
```

## ESLint 配置

`@zhzwz/z/eslint-config` 等同于 [@zhzwz/eslint-config](./packages/eslint-config)，两者任选其一：

```ts
import zhzwz from '@zhzwz/z/eslint-config'

export default zhzwz()
```

## 开发

```bash
pnpm playground  # 启动演示页面
pnpm typecheck
pnpm lint
pnpm test        # 包含构建产物的冒烟测试
```

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
