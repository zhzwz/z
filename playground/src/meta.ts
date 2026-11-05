import type { Component } from 'vue'
import type { ComponentMeta, EventMeta, PropertyMeta, SlotMeta } from 'vue-component-meta'
import { join } from 'node:path'
import process from 'node:process'
import { createCheckerByJson } from 'vue-component-meta'

/** 组件名到目录名，如 `ZButton` 到 `z-button`，与 resolver 的规则一致。 */
function toDir(name: string) {
  return name.replace(/\B([A-Z])/g, '-$1').toLowerCase()
}

// 文档站运行在 playground/ 下，组件在仓库根目录。检查器也以根目录为项目根，才能解析组件的依赖。
const repoRoot = join(process.cwd(), '..')

const checker = createCheckerByJson(repoRoot, {
  include: ['components/**/*.vue'],
  compilerOptions: {
    lib: ['ESNext', 'DOM'],
    module: 'ESNext',
    moduleResolution: 'Bundler',
    strict: true,
    target: 'ESNext',
  },
})

/** 组件源码的绝对路径。 */
export const componentFile = (name: string) => join(repoRoot, 'components', toDir(name), `${name}.vue`)

/** 从源码分析组件的 props、事件和插槽；失败时返回 undefined，页面据此跳过表格。 */
export function componentMeta(name: string): ComponentMeta | undefined {
  try {
    return checker.getComponentMeta(componentFile(name))
  } catch {

  }
}

/**
 * 只留组件自己声明的属性：去掉 key、ref 这类内置的全局属性（`global`），
 * 以及从依赖继承来的属性（如 naive-ui 的），后者查依赖的文档更准确。
 */
export function ownProps(name: string, props: PropertyMeta[]) {
  const file = componentFile(name)
  return props.filter(prop => !prop.global && prop.getDeclarations().every(item => item.file === file))
}

const entities: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
}

/** 把注释里用反引号括起来的名字渲染成行内代码。 */
export function inlineCode(text: string) {
  return text.replace(/[&<>"]/g, char => entities[char]!).replace(/`([^`]+)`/g, '<code>$1</code>')
}

// props 都是可选的，类型末尾的 `| undefined` 只是噪音。
const propType = (prop: PropertyMeta) => prop.type.replace(/\s*\|\s*undefined$/, '')

export function propRows(props: PropertyMeta[]) {
  return props.map(prop => ({
    default: prop.default ?? '',
    description: inlineCode(prop.description),
    name: prop.name,
    required: prop.required,
    type: propType(prop),
  }))
}

export function eventRows(events: EventMeta[]) {
  return events.map(event => ({
    description: inlineCode(event.description),
    name: event.name,
    // 签名形如 `(event: "click", event: MouseEvent): void`，第一个参数只是事件名，已经在第一列。
    signature: event.signature.replace(/^\(event:\s*"[^"]*",?\s*/, '').replace(/\):\s*\S+$/, ''),
  }))
}

export function slotRows(slots: SlotMeta[]) {
  return slots.map(slot => ({
    description: inlineCode(slot.description),
    name: slot.name,
  }))
}

const demos = import.meta.glob<{ default: Component }>('./demos/**/*.vue', { eager: true })
const demoSources = import.meta.glob<string>('./demos/**/*.vue', { query: '?raw', import: 'default', eager: true })

/** 按组件身份找到示例源码，页面里不必再重复写一遍路径。 */
export function demoSource(component: Component) {
  const entry = Object.entries(demos).find(([, module]) => module.default === component)
  return entry ? demoSources[entry[0]] : undefined
}
