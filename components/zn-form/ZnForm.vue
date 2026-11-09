<script lang="ts">
import type { FormInst } from 'naive-ui'
import type { ExtractPublicPropTypes, PropType, VNodeChild } from 'vue'
import type { ZnFormItemEntry } from './context'
import type { ZnFormSchema } from './schema'
import { formProps, NForm } from 'naive-ui'
import { getCurrentInstance, provide, useTemplateRef } from 'vue'
import { cloneData } from '../../shared/clone'
import { forwardMethods } from '../../shared/expose'
import { omit } from '../../shared/omit'
import { formRemovedProps } from '../removed-props'
import { useZnDefaults } from '../zn-config-provider/config'
import { ZnFormField } from '../zn-form-field'
import { toColumnCount, znFormKey } from './context'

export const znFormProps = {
  ...omit(formProps, formRemovedProps),
  /** 用配置渲染表单；不传时渲染默认插槽 */
  schema: Object as PropType<ZnFormSchema>,
  /** 列数；schema 里的 cols 优先，非正整数按 1 算，小数向下取整 */
  cols: { type: Number, default: 1 },
} as const

export type ZnFormProps = ExtractPublicPropTypes<typeof znFormProps>

export type ZnFormData = Record<string, unknown>
</script>

<script setup lang="ts">
const props = defineProps(znFormProps)
const emit = defineEmits<{
  /** 校验通过后触发，参数是数据的深拷贝 */
  submit: [data: ZnFormData]
}>()
defineSlots<{ default?: () => VNodeChild }>()
// 表单内部就地改数据，靠 `update:modelValue` 把新数据交回使用方。
// defineModel 已经声明了这个事件，但 `emit` 的类型里没有，这里单独取一个带类型的 emit。
const emitModel = getCurrentInstance()!.emit as (event: 'update:modelValue', value: ZnFormData) => void
const resolvedProps = useZnDefaults('ZnForm', props, znFormProps)
const model = defineModel<ZnFormData>({
  default: () => ({}),
})
const cols = () => toColumnCount(resolvedProps().schema?.cols ?? resolvedProps().cols)

const entries = new Set<ZnFormItemEntry>()
provide(znFormKey, {
  model: () => model.value,
  cols,
  notifyChange() {
    emitModel('update:modelValue', model.value)
  },
  rules: () => resolvedProps().rules as Record<string, unknown> | undefined,
  register(entry) {
    entries.add(entry)
    return () => entries.delete(entry)
  },
})

function nFormProps() {
  const { schema, cols, ...rest } = resolvedProps()
  return rest
}

const form = useTemplateRef<FormInst>('form')

/**
 * 校验整个表单，或只校验绑定了这些数据路径的表单项；不通过时抛出 naive 的校验错误。
 * 传了 `paths` 却没有表单项命中时抛错：字段改名后漏改调用方时，静默通过比报错更难发现。
 */
async function validate(paths?: string[]) {
  if (paths === undefined) {
    await form.value?.validate()
    return
  }
  if (paths.length === 0) {
    throw new Error('[ZnForm] validate([]) 不会校验任何字段；校验整个表单用 validate()，只校验部分字段请传入数据路径。')
  }
  const matched = [...entries]
    .filter(entry => entry.dataPaths.some(dataPath => paths.includes(dataPath)))
  if (matched.length === 0) {
    const bound = [...entries].flatMap(entry => entry.dataPaths).join('、') || '（无）'
    throw new Error(`[ZnForm] 没有表单项绑定这些数据路径：${paths.join('、')}；当前绑定的有：${bound}。`)
  }
  await form.value?.validate(undefined, matched.map(entry => entry.itemPath))
}

/** 校验通过时触发 `submit` 并返回 true */
async function submit() {
  const valid = await validate().then(() => true, () => false)
  if (valid) {
    emit('submit', cloneData(model.value))
  }
  return valid
}

function submitNative(event: Event) {
  event.preventDefault()
  submit()
}

/** 把各表单项恢复成 defaultValue（没有时为空值），并清除校验状态 */
function reset() {
  for (const entry of entries) {
    entry.reset()
  }
  form.value?.restoreValidation()
}

defineExpose({
  ...forwardMethods(form, ['restoreValidation', 'invalidateLabelWidth']),
  validate,
  submit,
  reset,
})
</script>

<template>
  <NForm
    ref="form"
    v-bind="nFormProps()"
    :class="{ 'zn-form': !resolvedProps().inline }"
    :model="model"
    :on-submit="submitNative"
    :style="{ '--zn-form-cols': cols() }"
  >
    <template v-if="resolvedProps().schema">
      <ZnFormField
        v-for="(field, index) in resolvedProps().schema!.fields"
        :key="field.id ?? index"
        :field="field"
      />
    </template>
    <slot v-else />
  </NForm>
</template>

<style>
.zn-form {
  display: grid;
  grid-template-columns: repeat(var(--zn-form-cols), minmax(0, 1fr));
  column-gap: 24px;
}
</style>
