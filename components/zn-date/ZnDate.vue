<script lang="ts">
import type { DatePickerInst, DatePickerSlots } from 'naive-ui'
import type { ExtractPublicPropTypes } from 'vue'
import { datePickerProps, NDatePicker } from 'naive-ui'
import { useTemplateRef } from 'vue'
import { dateFormat, datePickerRangeKeys, datePickerTimeKeys, datePickerValueKeys, isDateText } from '../../shared/date'
import { forwardMethods } from '../../shared/expose'
import { useDisplayedModel } from '../../shared/model'
import { omit } from '../../shared/omit'
import { useZnDefaults } from '../zn-config-provider/config'

export const znDateProps = omit(datePickerProps, [
  ...datePickerValueKeys,
  ...datePickerTimeKeys,
  ...datePickerRangeKeys,
])

export type ZnDateProps = ExtractPublicPropTypes<typeof znDateProps>

function toDateValue(value: unknown) {
  return isDateText(value, dateFormat)
    ? value
    : null
}
</script>

<script setup lang="ts">
const props = defineProps(znDateProps)
const slots = defineSlots<DatePickerSlots>()
const resolvedProps = useZnDefaults('ZnDate', props, znDateProps)
/** 格式固定为 `yyyy-MM-dd` */
const model = defineModel<string | null>({ default: null })
const value = useDisplayedModel(model, toDateValue)

const slotNames = () => Object.keys(slots) as (keyof DatePickerSlots)[]

const datePicker = useTemplateRef<DatePickerInst>('datePicker')
defineExpose(forwardMethods(datePicker, ['focus', 'blur']))
</script>

<template>
  <NDatePicker
    ref="datePicker"
    v-bind="resolvedProps()"
    :formatted-value="value"
    type="date"
    :value-format="dateFormat"
    @update:formatted-value="model = $event"
  >
    <!-- 各插槽的参数类型不同，遍历时无法按插槽名收窄 -->
    <template v-for="name in slotNames()" #[name]="slotProps">
      <slot :name="name" v-bind="slotProps as any" />
    </template>
  </NDatePicker>
</template>
