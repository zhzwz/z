<script lang="ts">
import type { CheckboxInst } from 'naive-ui'
import type { ExtractPublicPropTypes, VNodeChild } from 'vue'
import { checkboxProps, NCheckbox } from 'naive-ui'
import { useTemplateRef } from 'vue'
import { forwardMethods } from '../../shared/expose'
import { useDisplayedModel } from '../../shared/model'
import { omit } from '../../shared/omit'
import { useZnDefaults } from '../zn-config-provider/config'
import { useZnFormItemEmptyValues } from '../zn-form/context'

// 单个勾选框只有两种状态，值固定为 true / false；放在 ZnCheckboxGroup 里时由 value 决定是否勾选。
export const znCheckboxProps = omit(checkboxProps, [
  'checked',
  'defaultChecked',
  'onUpdate:checked',
  'onUpdateChecked',
  'checkedValue',
  'uncheckedValue',
])

export type ZnCheckboxProps = ExtractPublicPropTypes<typeof znCheckboxProps>

function toCheckboxValue(value: unknown) {
  return value === true
}
</script>

<script setup lang="ts">
const props = defineProps(znCheckboxProps)
defineSlots<{ default?: () => VNodeChild }>()
const resolvedProps = useZnDefaults('ZnCheckbox', props, znCheckboxProps)
const model = defineModel<boolean>({ default: false })
const checked = useDisplayedModel(model, toCheckboxValue)
useZnFormItemEmptyValues([undefined, null, '', false])

const checkbox = useTemplateRef<CheckboxInst>('checkbox')
defineExpose(forwardMethods(checkbox, ['focus', 'blur']))
</script>

<template>
  <NCheckbox ref="checkbox" v-bind="resolvedProps()" :checked="checked" @update:checked="model = $event">
    <template v-if="$slots.default" #default>
      <slot />
    </template>
  </NCheckbox>
</template>
