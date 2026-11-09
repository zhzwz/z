# 文档站

用 Astro 搭的组件文档，`pnpm dev` 启动，端口 11105。改组件后文档实时更新，演示代码按包名引入但指向仓库源码，不必先构建。

## 目录

```
src/
  content/docs/     文档页面（MDX），决定路由与侧边栏
  demos/            演示用的 Vue 组件，一个示例一个文件
  components/       Demo、ApiTable 等文档站的 Astro 组件
  layouts/          页面布局
  meta.ts           读组件源码生成接口表、按组件身份查找示例源码
  nav.ts            由文档页面生成侧边栏
```

## 新增一个组件的文档

1. 在 `src/demos/<组件目录名>/` 下按示例各写一个 `.vue`，文件第一行的 HTML 注释作为示例标题：

   ```vue
   <!-- 主题色与朴素按钮 -->
   <script setup lang="ts">
   import { ZnButton } from '@zhzwz/z/components/zn-button'
   </script>

   <template>
     <div class="row">
       <ZnButton type="primary">主要</ZnButton>
     </div>
   </template>
   ```

   布局辅助类（`.row`、`.icons`）在 `src/styles/demo.css` 里。

演示里如果用 naive-ui 的组件（`Zn*` 也算），要用 `NaiveTheme` 包一层，否则 naive-ui 不跟随站点的深浅色：

```vue
<script setup lang="ts">
import NaiveTheme from '@/components/NaiveTheme.vue'
</script>

<template>
  <NaiveTheme>
    <div class="row">...</div>
  </NaiveTheme>
</template>
```

演示里如果包了 `ZnConfigProvider`，页面上改用 `client:only="vue"`。它默认 `inlineThemeDisabled`，服务端渲染时 naive-ui 会访问 `document`。没包的 `ZnButton` 仍用 `client:visible`。

2. 在 `src/content/docs/components/` 下新建 `<组件目录名>.mdx`：

   ```mdx
   ---
   title: ZnButton
   description: 对 naive-ui 按钮的二次封装。
   order: 3
   ---

   import ApiTable from '@/components/ApiTable.astro'
   import Demo from '@/components/Demo.astro'
   import Types from '@/demos/zn-button/types.vue'

   <Demo of={Types}>
     <Types client:visible />
   </Demo>

   ## 接口

   <ApiTable name="ZnButton" />
   ```

   页面文件的位置和 `order` 决定侧边栏的顺序，不需要另外维护导航。

## 约定

- `public/` 下的文件会原样对外提供，谁都能读源码，别在里面放带注释的文件。图标因此放在 `src/assets/` 下，见本文末尾的「图标」。
- 主题默认跟随系统，`src/theme.ts` 统一管：选择存在 `localStorage.theme`，结果写到 `<html data-theme-choice>`，深浅两套 CSS 变量据此切换。新增样式用 `var(--*)`，不要写死颜色。
- 代码块的行号由 `global.css` 里的计数器生成，不进代码内容，复制不会带上。
- 示例必须写成独立的 `.vue` 文件并静态引入。Astro 的 `client:*` 只认静态导入，用变量或动态组件传进去会在构建时报 `NoMatchingImport`。
- `<Demo of={X}>` 的 `of` 和插槽里用的必须是同一个组件，`Demo` 靠组件身份找源码，写错会直接抛错。
- `ApiTable` 的接口表由 `vue-component-meta` 从组件源码读出，只列组件自己声明的 props：从 naive-ui 继承的不列，请链到依赖的文档。注释写在 props 的 JSDoc 里就会出现在说明列，反引号会渲染成行内代码。
- 新增页面目录时，在 `src/nav.ts` 的 `sectionTitles` 里登记分组标题。
- 完成改动后运行 `pnpm typecheck`、`pnpm lint`、`pnpm test`。

## 图标

图标只有一份源文件：`src/assets/favicon.svg`，注释和排版都写在那里。`src/assets` 不会被当成静态资源对外提供，所以注释不会漏出去。两处消费它：

- `/favicon.svg` 由 `src/pages/favicon.svg.ts` 这个端点输出，`faviconFile()` 会去掉注释与多余空白，产物压成一行。
- 侧栏的 `components/Brand.astro` 用 `faviconInline()`，会去掉源文件里的 `<style>`，改用站点主题变量。原因是 favicon 只能跟随**系统**配色，而页面内的图标要跟随**站点**的主题选择，两者不能共用一段 `<style>`。

改图标只改 `src/assets/favicon.svg`，两边自动同步。几何规则：

- **等粗单线**：横笔、斜笔、横笔同宽（`stroke-width: 5.2`），`stroke-linecap` 与 `stroke-linejoin` 都是 `round`。
- **中心线要内收**：圆头端点比直角端点向外多出半个描边宽度。路径用 `M10.6 11.1H21.4L10.6 20.9H21.4`，左右各收 `2.6`，墨迹才正好落在 `8–24 × 8.5–23.5`，即 16×15。若写成 `M8 9.5…` 会溢出到 7 附近。
- **容器**：`rect` 尺寸 32、圆角 `7.5`。
- **配色**：浅色 `#1f2328` 底 + 白线，深色反转为 `#e6edf3` 底 + `#0d1117` 线，做法与 GitHub 站点图标一致。

改完在浏览器打开 `/favicon.svg` 核对即可。
