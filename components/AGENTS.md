# 开发约定

本目录存放前端组件，以及只给这些组件用的函数。新增或修改前先读本文；约定有变化时同步更新本文。

## 目录与命名

- 每个组件一个目录，目录名是组件的 kebab-case 名：`z-flex/`、`zn-input/`。目录内为 `ZFlex.vue`、`ZFlex.test.ts`、`index.ts` 等。
- props 接口写在 `.vue` 里并导出（`export interface ZFlexProps`），由 `index.ts` 连同组件一起导出。
- 前缀表示实现方式：
  - `Z*`：自己实现的组件。
  - `Zn*`：naive-ui 的二次封装。
  - 不要用 `N` 开头的名字：`unplugin-vue-components` 的 `NaiveUiResolver` 会把它们解析到 `naive-ui`。
- 组件间共用的配置由提供方组件导出，例如 `useZnConfig()` 从 `zn-config-provider/` 导出。只给组件用的函数直接放在 `components/` 下的源文件里，不要放进带 `index.ts` 的目录，否则会被当成组件入口打包。与组件无关的工具放根目录 `shared/`。

## 入口与依赖

- 每个组件是一个单独的入口：`@zhzwz/z/components/<component>`，对应 `dist/components/<component>/index.js`。
- 组件 `<style>` 打进该组件自己的 CSS，由组件 JS 引入。使用方只会带上所用组件，以及这些组件引用到的组件的样式。服务端渲染需要把本包列入 `ssr.noExternal`（Nuxt 为 `build.transpile`），写法见 README。
- 不汇总导出，使用方主要通过 `@zhzwz/z/resolver` 自动引入。
- 组件允许依赖任何库，也允许互相引用；
- 使用方只需安装自己用到的组件的依赖，可选 peer 依赖写进根目录 `package.json`。
- 每个组件的外部依赖登记在 `test/dist.test.ts` 的 `componentDependencies` 里，冒烟测试会沿产物的 import 核对；
- README 中"需要安装的依赖"以它为准。
- 新增组件后同步更新：`componentDependencies`、根目录 `resolver.ts` 的组件名单、README、playground 演示。冒烟测试会检查前两项是否遗漏。

## Zn* 组件约定

1. 值绑定优先使用 `v-model`（`modelValue` / `update:modelValue`）
   - 写法见 `zn-input/ZnInput.vue`：用 `shared/omit.ts` 去掉 `components/removed-props.ts` 里列出的 naive props，值改由 `defineModel` 提供。
   - 有两个值时用具名 `v-model`，如 `ZnDateRange` 的 `v-model:start` / `v-model:end`，对应接口里的两个字段。
2. 一个组件只有一种值类型和一种存值格式。naive 用 prop 切换值类型或形态的（`multiple`、`type`、`valueFormat` 等），拆成单独的组件，并去掉这个 prop：`ZnSelect` / `ZnSelectMulti`，`ZnInput` / `ZnTextarea`，`ZnDate` / `ZnDateTime` / `ZnDateRange`。只为用得到的形态建组件，其余直接用 naive。
   - 日期存值格式固定（`shared/date.ts`）：日期 `yyyy-MM-dd`，日期时间 `yyyy-MM-dd HH:mm:ss`。显示格式 `format` 不影响数据，照常透传。
3. 值类型和空值：

   | 组件类型                                   | 值类型      | 没有值时               |
   | ------------------------------------------ | ----------- | ---------------------- |
   | 单值（输入框、数字、单选、下拉单选、日期） | `T \| null` | `null`                 |
   | 多值（多选组、下拉多选）                   | `T[]`       | `[]`                   |
   | 只有两种状态（开关、单个勾选框）           | `boolean`   | 没有空值，默认 `false` |

   需要"未设置 / 是 / 否"三种状态时用单选组，不要用开关。

4. 界面看到的就是会提交的数据：组件收到无法如实显示的值时，立即回写为界面上显示的值。例如开关收到 `null` 回写 `false`，多选收到 `null` 回写 `[]`，日期收到格式不合法的字符串回写 `null`。
   - 用 `shared/model.ts` 的 `useDisplayedModel(model, toDisplayed)` 实现，`toDisplayed` 对合法值必须原样返回（数组返回同一个引用）。
   - 文本类的空字符串 `''` 是合法值，不回写为 `null`：它可能是后端回填的原始数据，挂载时就地改写使用方的数据既意外又不可逆。用户主动清空时 naive 发 `''`，由组件在 `update:value` 里写成 `null`（见 `zn-input/ZnInput.vue`）。
   - 不在合法值上自作主张，例如不在渲染时把 `defaultValue` 写进 model。`ZnFormItem` 的 `defaultValue` 是使用方显式声明的表单行为，不受这条限制；写进 model 前要 `cloneData` 一份，否则多行共用一个 schema 时会互相串数据。
   - 选项异步加载的组件（如下拉选择）不因值暂时不在选项里而回写。
   - 能如实显示、但业务上不合法的值不回写，交给 `ZnForm` 的校验规则在提交时拦截。例如日期范围的开始晚于结束：保留显示，提交时报错。这类组件自带的校验用 `zn-form/context.ts` 的 `useZnFormItemCheck` 登记到所在的 `ZnFormItem`，写法见 `zn-date-range/ZnDateRange.vue`。
     - 值可能被外部整段改写（接口回填），校验结果要随之变化：`useZnFormItemCheck` 返回重新校验的函数，在相关值变化后调用它。重新校验走完整的 `validate()`（不只 `change` 规则，否则 `blur` 规则的报错会被清掉）；表单项没校验过时不刷出红字，`reset()` 后也不再自动校验。
     - 日期范围只有一端有值时 naive 显示不了：这一端不回写为 `null`（两端分两次赋值时先到的一端不会丢），界面留空，提交时由组件自带的校验拦下。此时 naive 认为「没有值」，自带的清空按钮不出现，所以组件自己在 `#date-icon` 位置补一个清空按钮（见 `zn-date-range/ZnDateRange.vue` 的 `showClear`）。日期框自己禁用，或所在表单禁用时，这个按钮不出现。
5. naive 的 props 全部透传且有类型：用 naive 导出的运行时 props 对象，如 `defineProps({ ...buttonProps })`，不要手抄 props 列表。
6. 插槽全部透传；实例方法（`focus`、`blur` 等）用 `defineExpose(forwardMethods(ref, [...]))` 转发（`shared/expose.ts`）。插槽按 `zn-button/ZnButton.vue` 的写法遍历转发：插槽名在渲染时取，不要放进 `computed`（`slots` 不是响应式的，父组件增减插槽后不会更新）。
   - 有插槽带参数时按 `zn-input/ZnInput.vue` 的写法转发参数；naive 没有导出插槽类型的组件（如勾选框、单选组）只转发默认插槽。
   - 新增 props 时，在 `.vue` 的普通 `<script>` 块里导出合并后的 props 对象和类型（`<script setup>` 的 `defineProps` 不能引用本块声明的变量），写法见 `zn-button/ZnButton.vue`：`znButtonProps = { ...buttonProps, ... }`，`ZnButtonProps = ExtractPublicPropTypes<typeof znButtonProps>`。没有新增 props 时直接复用 naive 的类型。
   - 新增的 props 不要传给 naive 组件。
   - prop 和插槽提供同样的内容时，插槽优先，例如 `label` 与默认插槽、`icon` 与 `#icon` 插槽。
7. 组件本身的默认值与 naive 保持一致。确有理由改动的，先和用户确认，再加进 `ZnConfigProvider` 的 `znBuiltinDefaults`，不写死在组件里。
   - 每个 Zn 组件都要用 `useZnDefaults('ZnXxx', props, znXxxProps)` 取合并后的 props，模板和脚本都读它（渲染时调用，不用 computed），并在 `zn-config-provider/config.ts` 的 `ZnComponentProps` 里登记。
     - 第三个参数是本组件声明给 naive 的 props 对象（即 `defineProps` 用的那个，如 `znInputProps`）。`useZnDefaults` 只输出它里面的键，`defineModel` 生成的 `modelValue`、`modelModifiers` 和各具名 model 键不会传给 naive——否则它们会成为 fallthrough attrs 落到根元素上，SSR 时还会把密码等值写进 HTML。合并 `defaults` 时同样只认这些键：`defaults` 可能来自外部配置，多余的键不能漏给 naive。
     - 新增 prop 时先加进这个 props 对象，`useZnDefaults` 才会透传它。
     - `defaults` 是运行时对象，绕过类型检查的取值仍可能进来（如给 `ZnInput` 传 `type: 'textarea'`）。组件要在传给 naive 前把不该出现的值收回到自己的契约里，写法见 `zn-input/ZnInput.vue` 的 `nInputProps`。
   - 中文 placeholder 由 naive 的 `zhCN` 语言包提供，宽度 naive 已经撑满，不需要默认值；yuzu 滚动条内容的 `overflow: hidden` 不迁移。
8. 表单：
   - schema（`zn-form/schema.ts`）只放纯数据，能存成 JSON，供以后的 `ZnFormBuilder` 生成和编辑；函数类的能力（自定义校验、联动）只加在 `ZnFormItem` 的 props 上，不进 schema。
   - 新的字段组件要在 `zn-form/components.ts` 的 `znFormComponents` 登记，有具名 v-model 的写明 `models`；`validateZnFormSchema` 和设计器都依赖这份登记。未登记的组件名在 `ZnFormField` 里不渲染，并用 `console.error` 报一次（生产环境也保留，便于定位空字段）。
   - 必填按空值判断：默认 `null`、`undefined`、`''`、`[]`。`false` 只在「只有两种状态」的字段（开关、单个勾选框）算未填——单选组、下拉里 `false` / `''` 可能是用户选中的真实选项，判空会误报。字段组件用 `zn-form/context.ts` 的 `useZnFormItemEmptyValues` 声明自己的空值。path 为对象时任一端为空即未填。
   - `ZnForm` 内部是就地改 `modelValue`，改完通过 `update:modelValue` 交回使用方（`znFormKey` 的 `notifyChange`）：使用方按不可变写法（每次传新对象）传数据时改动才不会丢。新增写入 model 的路径都要调它。
   - `path` 为对象时 naive 查不到 `ZnForm` 的 `rules`（它按 `path` 取值，而对象 path 交上去的是 `from,to` 这样的拼接串），`ZnFormItem` 自己按数据路径逐条跑，并把真实值交给 `validator`。只支持 `required` / `message` / `trigger` / `validator` / `level` / `key`，其余写法直接报错说明，不再静默通过。`validator` 可以返回结果，也可以调用 callback；声明了 callback 又没有返回值时，会等到 callback 被调用，包括函数返回之后才调用的情况。
   - `defaultValue` 的填充与 `reset()` 用同一套空值判断；没有 `defaultValue` 时按字段形状填空值（多值 `[]`、开关 `false`、其余 `null`），已经是空值的字段不改写。填充只在 `reset()` 时做；挂载时只补 `defaultValue`（字段为空才填），不改动任何已有数据。
   - path 来自外部配置，可能不可信：`shared/path.ts` 的 `getPath` / `setPath` 只读写对象自身的属性，并跳过 `__proto__`、`constructor`、`prototype`，`validateZnFormSchema` 把这类 path 报成 issue。改这两处时不要退回直接下标访问。
   - 列数相关的值（`cols`、`span`）只认正整数，渲染时用 `context.ts` 的 `toColumnCount` 兜底，不要直接拼进 CSS：`0` 会得到 `repeat(0, ...)`，小数会得到 `span 2.5`。
9. 不依赖使用方的 CSS 工具（UnoCSS 等），需要的样式写在组件自己的 `<style>` 里。

## 无障碍

- 图标默认是装饰性的（`aria-hidden="true"`）；使用方传了 `aria-label` / `aria-labelledby` 时，作为 `role="img"` 读出。
- 只有图标、没有文字的可交互组件，必须由使用方提供 `aria-label`、`aria-labelledby` 或 `title`。缺少时用 Vue 的 `warn` 在开发环境提示，每个实例只提示一次。
- 会让使用方数据或界面出错、又必须在生产环境才能定位的问题，不要用 Vue 的 `warn`（生产构建会剥掉），用 `console.error`，每个实例只报一次。
- 组件测试在全局检查 `console.warn` 没有被意外调用。

## 测试与检查

- 单元测试和源码放在一起（`components/**/*.test.ts`、`shared/**/*.test.ts`），运行在 happy-dom 环境。
- 根目录 `test/` 是构建产物的冒烟测试，`pnpm test` 会先构建再运行。
- `test/consumer/` 以使用方身份，分别用 `moduleResolution: nodenext` 和 `bundler`、不开 `skipLibCheck` 检查产物的类型。新增组件后要在这里导入。仓库自身的 `pnpm typecheck` 开了 `skipLibCheck`，发现不了声明文件的问题。
- 声明文件里推断出的类型可能引用依赖的内部路径（如 `naive-ui/es/_utils`），`tsdown.config.ts` 会在构建时把这类深层导入补全到具体文件。
- 新增组件后同步补 `playground/` 的文档与演示，写法见 [`playground/AGENTS.md`](../playground/AGENTS.md)。
- 完成改动后运行 `pnpm typecheck`、`pnpm lint`、`pnpm test`。
