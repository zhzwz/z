<script lang="ts">
import type { ExtractPublicPropTypes, VNodeChild } from 'vue'
import { NRadioGroup, radioGroupProps } from 'naive-ui'
import { useDisplayedModel } from '../../shared/model'
import { omit } from '../../shared/omit'
import { useZnDefaults } from '../zn-config-provider/config'

export const znRadioGroupProps = omit(radioGroupProps, [
  'value',
  'defaultValue',
  'onUpdate:value',
  'onUpdateValue',
])

export type ZnRadioGroupProps = ExtractPublicPropTypes<typeof znRadioGroupProps>

export type ZnRadioGroupValue = string | number | boolean

// 值不在 options 里时照常保留：options 可能异步加载。
function toRadioGroupValue(value: unknown) {
  if (typeof value === 'string' || typeof value === 'boolean') {
    return value as ZnRadioGroupValue
  }
  return typeof value === 'number' && Number.isFinite(value)
    ? value
    : null
}
</script>

<script setup lang="ts">
const props = defineProps(znRadioGroupProps)
defineSlots<{ default?: () => VNodeChild }>()
const resolvedProps = useZnDefaults('ZnRadioGroup', props, znRadioGroupProps)
const model = defineModel<ZnRadioGroupValue | null>({ default: null })
const value = useDisplayedModel(model, toRadioGroupValue)
</script>

<template>
  <NRadioGroup v-bind="resolvedProps()" :value="value" @update:value="model = $event">
    <template v-if="$slots.default" #default>
      <slot />
    </template>
  </NRadioGroup>
</template>
