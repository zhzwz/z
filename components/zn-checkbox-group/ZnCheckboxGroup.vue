<script lang="ts">
import type { ExtractPublicPropTypes, VNodeChild } from 'vue'
import { checkboxGroupProps, NCheckboxGroup } from 'naive-ui'
import { useDisplayedModel } from '../../shared/model'
import { omit } from '../../shared/omit'
import { checkboxGroupRemovedProps } from '../removed-props'
import { useZnDefaults } from '../zn-config-provider/config'

export const znCheckboxGroupProps = omit(checkboxGroupProps, checkboxGroupRemovedProps)

export type ZnCheckboxGroupProps = ExtractPublicPropTypes<typeof znCheckboxGroupProps>

function isChoice(value: unknown): value is string | number {
  return typeof value === 'string' || (typeof value === 'number' && Number.isFinite(value))
}

function toCheckboxGroupValue(value: unknown) {
  if (!Array.isArray(value)) {
    return []
  }
  // 每一项都能显示时返回原数组，避免 useDisplayedModel 反复回写。
  return value.every(isChoice)
    ? value as (string | number)[]
    : value.filter(isChoice)
}
</script>

<script setup lang="ts">
const props = defineProps(znCheckboxGroupProps)
defineSlots<{ default?: () => VNodeChild }>()
const resolvedProps = useZnDefaults('ZnCheckboxGroup', props, znCheckboxGroupProps)
const model = defineModel<(string | number)[]>({
  default: () => [],
})
const value = useDisplayedModel(model, toCheckboxGroupValue)
</script>

<template>
  <NCheckboxGroup v-bind="resolvedProps()" :value="value" @update:value="model = $event">
    <template v-if="$slots.default" #default>
      <slot />
    </template>
  </NCheckboxGroup>
</template>
