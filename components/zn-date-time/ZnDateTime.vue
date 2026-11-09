<script lang="ts">
import type { DatePickerInst, DatePickerSlots } from 'naive-ui'
import type { ExtractPublicPropTypes } from 'vue'
import { datePickerProps, NDatePicker } from 'naive-ui'
import { useTemplateRef } from 'vue'
import { dateTimeFormat, isDateText } from '../../shared/date'
import { forwardMethods } from '../../shared/expose'
import { useDisplayedModel } from '../../shared/model'
import { omit } from '../../shared/omit'
import { dateTimeRemovedProps } from '../removed-props'
import { useZnDefaults } from '../zn-config-provider/config'

export const znDateTimeProps = omit(datePickerProps, dateTimeRemovedProps)

export type ZnDateTimeProps = ExtractPublicPropTypes<typeof znDateTimeProps>

function toDateTimeValue(value: unknown) {
  return isDateText(value, dateTimeFormat)
    ? value
    : null
}
</script>

<script setup lang="ts">
const props = defineProps(znDateTimeProps)
const slots = defineSlots<DatePickerSlots>()
const resolvedProps = useZnDefaults('ZnDateTime', props, znDateTimeProps)
/** 格式固定为 `yyyy-MM-dd HH:mm:ss` */
const model = defineModel<string | null>({ default: null })
const value = useDisplayedModel(model, toDateTimeValue)

const slotNames = () => Object.keys(slots) as (keyof DatePickerSlots)[]

const datePicker = useTemplateRef<DatePickerInst>('datePicker')
defineExpose(forwardMethods(datePicker, ['focus', 'blur']))
</script>

<template>
  <NDatePicker
    ref="datePicker"
    v-bind="resolvedProps()"
    :formatted-value="value"
    type="datetime"
    :value-format="dateTimeFormat"
    @update:formatted-value="model = $event"
  >
    <!-- 各插槽的参数类型不同，遍历时无法按插槽名收窄 -->
    <template v-for="name in slotNames()" #[name]="slotProps">
      <slot :name="name" v-bind="slotProps as any" />
    </template>
  </NDatePicker>
</template>
