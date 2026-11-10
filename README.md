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

也可以手动导入。每个组件是单独的入口，没有汇总导出所有组件的入口。引入组件时会带上它自己的样式：

```ts
import { ZFlex } from '@zhzwz/z/components/z-flex'
import { ZnButton } from '@zhzwz/z/components/zn-button'
```

服务端渲染时把本包打进 bundle，组件引出的 CSS 才能由打包器处理：

```ts
export default defineConfig({
  ssr: {
    noExternal: ['@zhzwz/z'],
  },
})
```

Nuxt 里写成 `build.transpile: ['@zhzwz/z']`。

每个组件只依赖下表中的库，只需安装所用组件的依赖。`Zn*` 组件是对 [naive-ui](https://www.naiveui.com) 的二次封装。

| 组件                                                                                                                                                   | 需要安装的依赖                                |
| ------------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------- |
| `ZFlex`                                                                                                                                                | `vue`                                         |
| `ZIcon`                                                                                                                                                | `vue`、`@iconify/vue`                         |
| `ZnAccentPanel`、`ZnAccentSwitch`、`ZnButton`、`ZnSelect`、`ZnSelectMulti`                                                                             | `vue`、`naive-ui`、`@iconify/vue`             |
| `ZnDate`、`ZnDateTime`、`ZnDateRange`                                                                                                                  | `vue`、`naive-ui`、`date-fns`                 |
| `ZnForm`、`ZnFormField`                                                                                                                                | `vue`、`naive-ui`、`date-fns`、`@iconify/vue` |
| `ZnCheckbox`、`ZnCheckboxGroup`、`ZnConfigProvider`、`ZnFormItem`、`ZnInput`、`ZnInputNumber`、`ZnRadioGroup`、`ZnScrollbar`、`ZnSwitch`、`ZnTextarea` | `vue`、`naive-ui`                             |

`Zn*` 表单组件统一用 `v-model` 绑定值，不提供 `value` / `v-model:value`。没有值时，单值组件为 `null`，多值组件为 `[]`，开关和单个勾选框为 `false`；收到无法显示的值时会立即回写为界面上显示的值。文本组件的空字符串 `''` 是合法值，不会被改写成 `null`（用户主动清空时才写 `null`）。

每个组件只有一种值类型，不用 prop 切换：多选用 `ZnSelectMulti`，多行文本用 `ZnTextarea`。日期的存值格式固定，`ZnDate` 为 `yyyy-MM-dd`，`ZnDateTime` 为 `yyyy-MM-dd HH:mm:ss`。日期范围的起止是两个字段：

```vue
<ZnDateRange v-model:start="form.startDate" v-model:end="form.endDate" />
```

两个 `v-model` 各自独立：可以先赋 `start`，之后再赋 `end`（中间隔着 `await` 也行），先到的一端不会被清掉，接口分两次返回时不必把两端凑到同一个 tick 里赋值。只有一端有值时日期框显示为空，右侧出现清空按钮，可以直接退出这种半填状态；放在 `ZnFormItem` 里时，自带校验会提示“开始和结束日期需要同时填写”，提交不通过。

### 表单

`ZnForm` 包了一层 naive 的 `NForm`，用 `v-model` 绑定数据。表单项可以写在模板里，也可以用 schema 配置，两种写法渲染结果相同：

```vue
<ZnForm v-model="data" :cols="2" @submit="save">
  <ZnFormItem path="name" label="名称" required>
    <ZnInput v-model="data.name" />
  </ZnFormItem>
  <ZnFormItem :path="{ start: 'startDate', end: 'endDate' }" label="有效期" required>
    <ZnDateRange v-model:start="data.startDate" v-model:end="data.endDate" />
  </ZnFormItem>
</ZnForm>

<ZnForm v-model="data" :schema="schema" @submit="save" />
```

```ts
const schema: ZnFormSchema = {
  cols: 2,
  fields: [
    {
      component: 'ZnInput',
      path: 'name',
      label: '名称',
      required: true
    },
    {
      component: 'ZnDateRange',
      path: { start: 'startDate', end: 'endDate' },
      label: '有效期',
      required: true
    },
  ],
}
```

- `path` 写字符串时对应组件的 `v-model`，支持 `contact.phone` 这样的点号路径；组件有多个值时写对象，键是组件的具名 v-model。
- `path` 里的段不能是 `__proto__`、`constructor`、`prototype`，这类路径会顺着原型链读到或写到全局对象，读写时一律跳过，并在开发环境为每个这样的 path 提示一次。schema 来自外部或数据库时要先用 `validateZnFormSchema` 拦下。
- schema 只含纯数据，可以存成 JSON；`validateZnFormSchema(schema)` 检查未知组件、path 形状不对、path 含不安全的段、`id` 重复、`cols` / `span` 不是正整数等问题，返回的 issue 里 `index` 是出问题的字段下标，schema 本身的问题（`cols`）没有 `index`。可用的组件见 `znFormComponents`。
- 未知组件（`component` 不在 `znFormComponents` 里）的字段不渲染。同时用 `console.error` 报一次，带上组件名和 path：这条在生产构建里也保留，避免只剩一个没有任何线索的空位。同一个 `ZnFormField` 实例里同一个组件名只报一次。schema 来自外部时仍应先跑 `validateZnFormSchema`，一次拿到全部问题。
- `cols`（列数）和 `span`（占几列）只认正整数。渲染时也会兜底：非正整数按 1 算，小数向下取整，`span` 超过 `cols` 时按 `cols` 算，不会拼出 `repeat(0, minmax(0, 1fr))`、`span 2.5` 这类非法 CSS。
- 必填时 `undefined`、`null`、`''`、`[]` 算未填，字段上还没有这个键也算；path 为对象时任一端为空也算。`false` 只在开关、单个勾选框这类「只有两种状态」的组件算未填；单选组、下拉里 `false` / `''` 可能是用户选中的真实选项，不会被判成未填。`ZnDateRange` 自带两条校验：只有一端有值时提示“开始和结束日期需要同时填写”，开始晚于结束时提示“开始日期不能晚于结束日期”。
- `rules` 按数据路径写。`path` 为对象（如 `{ start: 'startDate', end: 'endDate' }`）时，`ZnFormItem` 会按每个数据路径各跑一次，并把该路径的真实值交给 `validator`。这种写法只支持 `required`、`message`、`trigger`、`validator`、`level`、`key`，用了别的字段（`min`、`pattern` 等）会报错说明，不会静默通过。
- 表单内部是就地修改 `v-model` 绑定的对象，改完会触发一次 `update:modelValue`，所以按不可变写法（每次渲染传新对象）传数据也不会丢改动。
- `submit` 事件在校验通过后触发，参数是数据的深拷贝（保留 `Date`、`Map`、`Set`、`RegExp`、TypedArray、`File` 等类型，支持循环引用；类实例保留原型和自身可枚举属性，但依赖私有字段的实例拷出来不能用，这类值不要放进表单）；表单里按回车也会提交。实例方法有 `submit()`、`validate(paths?)`、`reset()`、`restoreValidation()`；`validate()` 校验整个表单，`validate(['endDate'])` 只校验绑定了这些数据路径的表单项，传了 `paths` 却没有表单项命中时（包括 `validate([])`）直接抛错，避免字段改名后调用方漏改时静默通过。`reset()` 把各项恢复成 `defaultValue`，没有时恢复成空值：多值字段为 `[]`，开关、勾选框为 `false`，其余为 `null`。已经是空值的字段不会被改写，多值字段也不会先变成 `null` 再由组件回写。

### 全局配置

用 `ZnConfigProvider` 包住应用。它包了一层 naive 的 `NConfigProvider`，props 全部透传，另外：

- 默认使用中文语言包（`zhCN`、`dateZhCN`），`abstract` 和 `inlineThemeDisabled` 默认开启。
- 最外层没传 `theme` 时，读 `<html data-z-theme>`（`light`、`dark`、`auto`；没写按 `auto`，跟随系统配色）。传了 `theme` 就用传入的值，`null` 表示浅色。切换用 `setZnTheme()`。要避免首屏闪一下浅色，在 head 里同步写上这个属性。
- 强调色只看 `<html data-z-accent>`（`blue`、`cyan`、`orange`）。没写或不认识时，最外层 `ZnConfigProvider` 写成默认的 `blue`。`ZnAccentPanel`、`ZnAccentSwitch` 和 `setZAccent()` 都只改这个属性。每套从 `50` 到 `950` 共 11 阶，色值是 Tailwind 的 OKLCH，页面里用 `var(--z-theme-accent-500)` 这类变量。naive 的主色从这套里取：亮色按钮用 `600`，悬停 `500`，按下 `700`；暗色按钮用 `400`。`themeOverrides.common` 里写了的 primary 色优先。色阶和 `setZAccent()`、`zAccentStyleSheet()` 从 `@zhzwz/z/accent` 引入。
- 内置 `NLoadingBarProvider`、`NDialogProvider`、`NNotificationProvider`、`NMessageProvider`，里面可以直接用 `useMessage()` 等。嵌套的 `ZnConfigProvider` 不会重复套这几层。
- 带一组内置的组件默认值（`znBuiltinDefaults`，如输入类可清空、下拉可搜索），用 `defaults` 按组件覆盖：

```vue
<ZnConfigProvider :defaults="{ ZnInput: { clearable: false }, ZnSelect: { size: 'small' } }">
  <App />
</ZnConfigProvider>
```

优先级从高到低：组件上显式传的 prop、内层 `defaults`、外层 `defaults`、内置默认值、naive 默认值。不在 `ZnConfigProvider` 里的组件使用 naive 默认值。

`defaults` 只对组件自己声明的 prop 生效。写了组件不提供或不接受的值（如给 `ZnInput` 传 `modelValue` 或 `type: 'textarea'`）会被忽略，不会透传给 naive：那会绕过组件的约定，还可能作为属性写进 DOM 和 SSR 输出。`class`、`style` 等未声明属性同样不接收。

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
