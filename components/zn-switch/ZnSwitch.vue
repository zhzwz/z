<script lang="ts">
import type { SwitchSlots } from 'naive-ui'
import type { ExtractPublicPropTypes } from 'vue'
import { NSwitch, switchProps } from 'naive-ui'
import { useDisplayedModel } from '../../shared/model'
import { omit } from '../../shared/omit'
import { switchRemovedProps } from '../removed-props'
import { useZnDefaults } from '../zn-config-provider/config'
import { useZnFormItemEmptyValues } from '../zn-form/context'

// 开关只有两种状态，值固定为 true / false，不提供 checkedValue / uncheckedValue。
export const znSwitchProps = omit(switchProps, switchRemovedProps)

export type ZnSwitchProps = ExtractPublicPropTypes<typeof znSwitchProps>

function toSwitchValue(value: unknown) {
  return value === true
}
</script>

<script setup lang="ts">
const props = defineProps(znSwitchProps)
const slots = defineSlots<SwitchSlots>()
const resolvedProps = useZnDefaults('ZnSwitch', props, znSwitchProps)
const model = defineModel<boolean>({ default: false })
const value = useDisplayedModel(model, toSwitchValue)
// 开关的 false 是「关」，不是一个值：必填时算未填，否则必填开关永远能提交。
useZnFormItemEmptyValues([undefined, null, '', false])

const slotNames = () => Object.keys(slots) as (keyof SwitchSlots)[]
</script>

<template>
  <NSwitch v-bind="resolvedProps()" :value="value" @update:value="model = $event">
    <template v-for="name in slotNames()" #[name]>
      <slot :name="name" />
    </template>
  </NSwitch>
</template>
