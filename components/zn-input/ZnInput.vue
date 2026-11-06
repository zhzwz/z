<script lang="ts">
import type { InputInst, InputSlots } from 'naive-ui'
import type { ExtractPublicPropTypes, PropType } from 'vue'
import { inputProps, NInput } from 'naive-ui'
import { useTemplateRef } from 'vue'
import { forwardMethods } from '../../shared/expose'
import { useDisplayedModel } from '../../shared/model'
import { omit } from '../../shared/omit'
import { toTextValue } from '../../shared/text'
import { useZnDefaults } from '../zn-config-provider/config'

// 多行文本用 ZnTextarea；pair 模式的值是两个字符串，与单值的 v-model 不兼容，不提供。
export const znInputProps = {
  ...omit(inputProps, [
    'value',
    'defaultValue',
    'onUpdate:value',
    'onUpdateValue',
    'pair',
    'separator',
    'rows',
    'resizable',
  ]),
  type: {
    type: String as PropType<'text' | 'password'>,
    default: 'text',
  },
} as const

export type ZnInputProps = ExtractPublicPropTypes<typeof znInputProps>
</script>

<script setup lang="ts">
const props = defineProps(znInputProps)
const slots = defineSlots<InputSlots>()
const resolvedProps = useZnDefaults('ZnInput', props, znInputProps)
const model = defineModel<string | null>({ default: null })
const value = useDisplayedModel(model, toTextValue)

// 类型只在 type 上声明成 'text' | 'password'，但 ZnConfigProvider.defaults 是运行时对象，
// 传进 'textarea' 会把单行输入变成多行，值语义也对不上。这里兜回单行。
function nInputProps() {
  const { type, ...rest } = resolvedProps()
  return {
    ...rest,
    type: type === 'password'
      ? 'password' as const
      : 'text' as const,
  }
}

const slotNames = () => Object.keys(slots) as (keyof InputSlots)[]

const input = useTemplateRef<InputInst>('input')
defineExpose(forwardMethods(input, [
  'focus',
  'blur',
  'select',
  'clear',
  'activate',
  'deactivate',
  'scrollTo',
]))
</script>

<template>
  <NInput ref="input" v-bind="nInputProps()" :value="value" @update:value="model = $event || null">
    <!-- 各插槽的参数类型不同，遍历时无法按插槽名收窄 -->
    <template v-for="name in slotNames()" #[name]="slotProps">
      <slot :name="name" v-bind="slotProps as any" />
    </template>
  </NInput>
</template>
