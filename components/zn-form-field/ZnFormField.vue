<script lang="ts">
import type { ExtractPublicPropTypes, PropType } from 'vue'
import type { ZnFormFieldSchema } from '../zn-form/schema'
import { inject, watchEffect } from 'vue'
import { getPath, setPath } from '../../shared/path'
import { ZnFormItem } from '../zn-form-item'
import { getZnFormComponent } from '../zn-form/components'
import { znFormKey } from '../zn-form/context'

export const znFormFieldProps = {
  field: { type: Object as PropType<ZnFormFieldSchema>, required: true },
} as const

export type ZnFormFieldProps = ExtractPublicPropTypes<typeof znFormFieldProps>
</script>

<script setup lang="ts">
const props = defineProps(znFormFieldProps)
const form = inject(znFormKey, null)

const meta = () => getZnFormComponent(props.field.component)

/**
 * 同一个组件名只报一次：`watchEffect` 会随 field 重跑，改 path、换对象都不必重复刷屏。
 * 按实例记而不是模块级：SSR 时模块级集合会跨请求残留，第二个请求就静默了。
 */
const reported = new Set<string>()

/** path 正常是字符串或字符串对象，报错本身不能成为新的故障来源 */
function toPathText(path: unknown) {
  if (typeof path === 'string') {
    return path
  }
  try {
    return JSON.stringify(path)
  } catch {
    return String(path)
  }
}

/**
 * 用 console.error 而不是 Vue 的 warn：生产构建会把 warn 剥掉，字段就只剩一个没有任何线索的空位。
 * 也可以先用 validateZnFormSchema 整体检查 schema。
 */
function reportUnknownComponent() {
  const { component } = props.field
  if (reported.has(component)) {
    return
  }
  reported.add(component)
  console.error(`[ZnFormField] 未知组件 ${component}（path：${toPathText(props.field.path)}），这个字段不会渲染。可用的组件见 znFormComponents，schema 可以先用 validateZnFormSchema 检查。`)
}

/** 同一实例只报一次，避免 watchEffect 每次重跑都刷屏 */
watchEffect(() => {
  if (meta()) {
    return
  }
  reportUnknownComponent()
})

function modelBindings() {
  const model = form?.model() ?? {}
  const { path } = props.field
  const models = typeof path === 'string'
    ? [
        ['modelValue', path],
      ]
    : Object.entries(path)
  const bindings: Record<string, unknown> = {}
  for (const [name, dataPath] of models) {
    bindings[name] = getPath(model, dataPath)
    bindings[`onUpdate:${name}`] = (value: unknown) => {
      setPath(model, dataPath, value)
      form?.notifyChange()
    }
  }
  return bindings
}
</script>

<template>
  <ZnFormItem
    v-if="meta()"
    :default-value="field.defaultValue"
    :help="field.help"
    :label="field.label"
    :path="field.path"
    :required="field.required"
    :span="field.span"
  >
    <component :is="meta()!.component" v-bind="{ ...field.props, ...modelBindings() }" />
  </ZnFormItem>
</template>
