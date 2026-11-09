<script lang="ts">
import type { SelectInst, SelectSlots } from 'naive-ui'
import type { ExtractPublicPropTypes } from 'vue'
import { NSelect, selectProps } from 'naive-ui'
import { useTemplateRef } from 'vue'
import { forwardMethods } from '../../shared/expose'
import { useDisplayedModel } from '../../shared/model'
import { omit } from '../../shared/omit'
import { useZnDefaults } from '../zn-config-provider/config'
import { iconLabelRenderer, optionsProp } from './options'

// 多选用 ZnSelectMulti，这里去掉 multiple 和只在多选时生效的 props。
export const znSelectProps = {
  ...omit(selectProps, [
    'value',
    'defaultValue',
    'onUpdate:value',
    'onUpdateValue',
    'multiple',
    'maxTagCount',
    'ellipsisTagPopoverProps',
    'renderTag',
  ]),
  options: optionsProp,
} as const

export type ZnSelectProps = ExtractPublicPropTypes<typeof znSelectProps>

export type ZnSelectValue = string | number

function toSelectValue(value: unknown) {
  if (typeof value === 'string') {
    return value
  }
  return typeof value === 'number' && Number.isFinite(value)
    ? value
    : null
}
</script>

<script setup lang="ts">
const props = defineProps(znSelectProps)
const slots = defineSlots<SelectSlots>()
const resolvedProps = useZnDefaults('ZnSelect', props, znSelectProps)
const model = defineModel<ZnSelectValue | null>({ default: null })

// 值不在 options 里时照常保留：options 可能异步加载。
const value = useDisplayedModel(model, toSelectValue)

const renderLabelWithIcon = iconLabelRenderer(() => resolvedProps().labelField)

const slotNames = () => Object.keys(slots) as (keyof SelectSlots)[]

const select = useTemplateRef<SelectInst>('select')
defineExpose(forwardMethods(select, [
  'focus',
  'blur',
  'focusInput',
  'blurInput',
]))
</script>

<template>
  <NSelect
    ref="select"
    v-bind="resolvedProps()"
    :render-label="resolvedProps().renderLabel ?? renderLabelWithIcon"
    :value="value"
    @update:value="model = $event"
  >
    <template v-for="name in slotNames()" #[name]>
      <slot :name="name" />
    </template>
  </NSelect>
</template>
