# 开发约定

本目录存放前端组件，新增或修改组件前先读本文；约定有变化时同步更新本文。

## 目录与命名

- 每个组件一个目录，目录名是组件的 kebab-case 名：`z-button/`、`zn-input/`。目录内为 `ZButton.vue`、`ZButton.test.ts`、`index.ts` 等。
- props 接口写在 `.vue` 里并导出（`export interface ZButtonProps`），由 `index.ts` 连同组件一起导出。
- 前缀表示实现方式：
  - `Z*`：自己实现的组件。
  - `Zn*`：naive-ui 的二次封装。
  - 不要用 `N` 开头的名字：`unplugin-vue-components` 的 `NaiveUiResolver` 会把它们解析到 `naive-ui`。
- 组件间共用的配置由提供方组件导出，例如 `useZnConfig()` 从 `zn-config-provider/` 导出。与具体组件无关的工具放根目录 `shared/`，`components/` 下只放组件目录。

## 入口与依赖

- 每个组件是一个单独的入口：`@zhzwz/z/components/<component>`，对应 `dist/components/<component>/index.js`。
- 不汇总导出，使用方主要通过 `@zhzwz/z/resolver` 自动引入。
- 组件允许依赖任何库，也允许互相引用；
- 使用方只需安装自己用到的组件的依赖，可选 peer 依赖写进根目录 `package.json`。
- 每个组件的外部依赖登记在 `test/dist.test.ts` 的 `componentDependencies` 里，冒烟测试会沿产物的 import 核对；
- README 中"需要安装的依赖"以它为准。
- 新增组件后同步更新：`componentDependencies`、根目录 `resolver.ts` 的组件名单、README、playground 演示。冒烟测试会检查前两项是否遗漏。

## Zn* 组件约定

1. 值绑定优先使用 `v-model`（`modelValue` / `update:modelValue`）
2. 值类型和空值：

   | 组件类型                                   | 值类型      | 没有值时               |
   | ------------------------------------------ | ----------- | ---------------------- |
   | 单值（输入框、数字、单选、下拉单选、日期） | `T \| null` | `null`                 |
   | 多值（多选组、下拉多选）                   | `T[]`       | `[]`                   |
   | 只有两种状态（开关、单个勾选框）           | `boolean`   | 没有空值，默认 `false` |

   需要"未设置 / 是 / 否"三种状态时用单选组，不要用开关。

3. 界面看到的就是会提交的数据：组件收到无法如实显示的值时，立即回写为界面上显示的值。例如开关收到 `null` 回写 `false`，多选收到 `null` 回写 `[]`，日期收到格式不合法的字符串回写 `null`。
   - 不在合法值上自作主张，例如不在渲染时把 `defaultValue` 写进 model。
   - 选项异步加载的组件（如下拉选择）不因值暂时不在选项里而回写。
4. naive 的 props 全部透传且有类型：用 naive 导出的运行时 props 对象，如 `defineProps({ ...buttonProps })`，不要手抄 props 列表。
5. 插槽全部透传；实例方法（`focus`、`blur` 等）用 `defineExpose` 转发。插槽按 `zn-button/ZnButton.vue` 的写法遍历转发：插槽名在渲染时取，不要放进 `computed`（`slots` 不是响应式的，父组件增减插槽后不会更新）。
   - 新增 props 时，在 `.vue` 的普通 `<script>` 块里导出合并后的 props 对象和类型（`<script setup>` 的 `defineProps` 不能引用本块声明的变量），写法见 `zn-button/ZnButton.vue`：`znButtonProps = { ...buttonProps, ... }`，`ZnButtonProps = ExtractPublicPropTypes<typeof znButtonProps>`。没有新增 props 时直接复用 naive 的类型。
   - 新增的 props 不要传给 naive 组件。
   - prop 和插槽提供同样的内容时，插槽优先，例如 `label` 与默认插槽、`icon` 与 `#icon` 插槽。
6. 默认值与 naive 保持一致。确有理由改动的，先和用户确认，并做成 `ZnConfigProvider` 里可配置的全局默认值，不写死在组件里。
7. 不依赖使用方的 CSS 工具（UnoCSS 等），需要的样式写在组件自己的 `<style>` 里。

## 无障碍

- 图标默认是装饰性的（`aria-hidden="true"`）；使用方传了 `aria-label` / `aria-labelledby` 时，作为 `role="img"` 读出。
- 只有图标、没有文字的可交互组件，必须由使用方提供 `aria-label`、`aria-labelledby` 或 `title`。缺少时用 Vue 的 `warn` 在开发环境提示，每个实例只提示一次。
- 组件测试在全局检查 `console.warn` 没有被意外调用。

## 测试与检查

- 单元测试和组件放在一起（`components/**/*.test.ts`），运行在 happy-dom 环境。
- 根目录 `test/` 是构建产物的冒烟测试，`pnpm test` 会先构建再运行。
- `test/consumer/` 以使用方身份，分别用 `moduleResolution: nodenext` 和 `bundler`、不开 `skipLibCheck` 检查产物的类型。新增组件后要在这里导入。仓库自身的 `pnpm typecheck` 开了 `skipLibCheck`，发现不了声明文件的问题。
- 声明文件里推断出的类型可能引用依赖的内部路径（如 `naive-ui/es/_utils`），`tsdown.config.ts` 会在构建时把这类深层导入补全到具体文件。
- 完成改动后运行 `pnpm typecheck`、`pnpm lint`、`pnpm test`。
