<script lang="ts">
import type { SelectInst, SelectSlots } from 'naive-ui'
import type { ExtractPublicPropTypes } from 'vue'
import type { ZnSelectValue } from '../zn-select'
import { NSelect, selectProps } from 'naive-ui'
import { useTemplateRef } from 'vue'
import { forwardMethods } from '../../shared/expose'
import { useDisplayedModel } from '../../shared/model'
import { omit } from '../../shared/omit'
import { selectMultiRemovedProps } from '../removed-props'
import { useZnDefaults } from '../zn-config-provider/config'
import { iconLabelRenderer, optionsProp } from '../zn-select/options'

export const znSelectMultiProps = {
  ...omit(selectProps, selectMultiRemovedProps),
  options: optionsProp,
} as const

export type ZnSelectMultiProps = ExtractPublicPropTypes<typeof znSelectMultiProps>

function isChoice(value: unknown): value is ZnSelectValue {
  return typeof value === 'string' || (typeof value === 'number' && Number.isFinite(value))
}

function toSelectMultiValue(value: unknown) {
  if (!Array.isArray(value)) {
    return []
  }
  return value.every(isChoice)
    ? value
    : value.filter(isChoice)
}
</script>

<script setup lang="ts">
const props = defineProps(znSelectMultiProps)
const slots = defineSlots<SelectSlots>()
const resolvedProps = useZnDefaults('ZnSelectMulti', props, znSelectMultiProps)
const model = defineModel<ZnSelectValue[]>({
  default: () => [],
})

// 值不在 options 里时照常保留：options 可能异步加载。
const value = useDisplayedModel(model, toSelectMultiValue)

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
    multiple
    :render-label="resolvedProps().renderLabel ?? renderLabelWithIcon"
    :value="value"
    @update:value="model = $event"
  >
    <template v-for="name in slotNames()" #[name]>
      <slot :name="name" />
    </template>
  </NSelect>
</template>
