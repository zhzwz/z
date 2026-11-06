<script lang="ts">
import type { ExtractPublicPropTypes, VNodeChild } from 'vue'
import { checkboxGroupProps, NCheckboxGroup } from 'naive-ui'
import { useDisplayedModel } from '../../shared/model'
import { omit } from '../../shared/omit'
import { useZnDefaults } from '../zn-config-provider/config'

export const znCheckboxGroupProps = omit(checkboxGroupProps, [
  'value',
  'defaultValue',
  'onUpdate:value',
  'onUpdateValue',
])

export type ZnCheckboxGroupProps = ExtractPublicPropTypes<typeof znCheckboxGroupProps>

function toCheckboxGroupValue(value: unknown) {
  return Array.isArray(value)
    ? value as (string | number)[]
    : []
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
