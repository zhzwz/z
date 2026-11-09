<script lang="ts">
import type { DatePickerInst, DatePickerSlots } from 'naive-ui'
import type { ExtractPublicPropTypes } from 'vue'
import { datePickerProps, NDatePicker } from 'naive-ui'
import { computed, inject, useTemplateRef, watch } from 'vue'
import { dateFormat, datePickerTimeKeys, datePickerValueKeys, isDateText } from '../../shared/date'
import { forwardMethods } from '../../shared/expose'
import { useDisplayedModel } from '../../shared/model'
import { omit } from '../../shared/omit'
import { useZnDefaults } from '../zn-config-provider/config'
import { useZnFormItemCheck } from '../zn-form/context'

export const znDateRangeProps = omit(datePickerProps, [
  ...datePickerValueKeys,
  ...datePickerTimeKeys,
  'placeholder',
])

export type ZnDateRangeProps = ExtractPublicPropTypes<typeof znDateRangeProps>

function toDateText(value: unknown) {
  return isDateText(value, dateFormat)
    ? value
    : null
}
</script>

<script setup lang="ts">
const props = defineProps(znDateRangeProps)
const slots = defineSlots<DatePickerSlots>()
const resolvedProps = useZnDefaults('ZnDateRange', props, znDateRangeProps)
/** 开始日期，格式固定为 `yyyy-MM-dd` */
const start = defineModel<string | null>('start', { default: null })
/** 结束日期，格式固定为 `yyyy-MM-dd` */
const end = defineModel<string | null>('end', { default: null })
const startDate = useDisplayedModel(start, toDateText)
const endDate = useDisplayedModel(end, toDateText)

// naive 只能同时显示起止两个日期：只有一端时界面留空，但这一端不回写为 null，
// 两端分开赋值（如接口分两次返回）时先到的一端不会丢；缺的一端由表单校验拦截。
const range = computed<[string, string] | null>(() => startDate.value && endDate.value
  ? [startDate.value, endDate.value]
  : null)

const revalidate = useZnFormItemCheck(() => {
  const from = startDate.value
  const to = endDate.value
  if ((from === null) !== (to === null)) {
    return '开始和结束日期需要同时填写'
  }
  return from !== null && to !== null && from > to
    ? '开始日期不能晚于结束日期'
    : undefined
})

// 日期框自己选的值 naive 会按 change 触发校验；外部改写（如接口回填）时补一次，让 feedback 跟着变。
watch([startDate, endDate], () => revalidate())

function updateRange(value: [string, string] | null) {
  start.value = value?.[0] ?? null
  end.value = value?.[1] ?? null
}

function clear() {
  updateRange(null)
}

// naive 把表单的 disabled 注在这个字符串键上，没有公开导出。日期框靠它禁用，清空按钮也要跟着。
const naiveFormItem = inject<{ disabled: { value: boolean } } | null>('n-form-item', null)

function pickerDisabled() {
  const { disabled } = resolvedProps()
  if (disabled !== undefined) {
    return disabled === true
  }
  return naiveFormItem?.disabled.value === true
}

// 只有一端有值时 range 是 null，naive 认为没有值，trigger 上的清空按钮不出现：这一端既看不见也清不掉。
// 补一个清空按钮，让用户能从这种半填状态里出来。
function showClear() {
  return resolvedProps().clearable
    && !pickerDisabled()
    && (startDate.value !== null || endDate.value !== null)
    && range.value === null
}

const slotNames = () => (Object.keys(slots) as (keyof DatePickerSlots)[]).filter(name => name !== 'date-icon')

const datePicker = useTemplateRef<DatePickerInst>('datePicker')
defineExpose(forwardMethods(datePicker, ['focus', 'blur']))
</script>

<template>
  <NDatePicker
    ref="datePicker"
    v-bind="resolvedProps()"
    :formatted-value="range"
    type="daterange"
    :value-format="dateFormat"
    @update:formatted-value="updateRange"
  >
    <!-- 各插槽的参数类型不同，遍历时无法按插槽名收窄 -->
    <template v-for="name in slotNames()" #[name]="slotProps">
      <slot :name="name" v-bind="slotProps as any" />
    </template>
    <!--
      只有一端有值时 range 是 null，naive 认为没有值：清空按钮不出现，这一端既看不见也清不掉。
      这个位置默认放日期图标，换成清空按钮即可；其余情况返回 undefined，naive 用回它自己的图标。
    -->
    <template #date-icon>
      <slot v-if="slots['date-icon']" name="date-icon" />
      <button
        v-else-if="showClear()"
        aria-label="清空日期范围"
        class="zn-date-range__clear"
        type="button"
        @click.stop="clear"
        @mousedown.prevent
      >
        <svg aria-hidden="true" viewBox="0 0 16 16">
          <path
            d="M8 2a6 6 0 1 0 0 12A6 6 0 0 0 8 2m-1.47 3.84a.6.6 0 0 1 .85 0L8 6.46l.62-.62a.6.6 0 1 1 .85.85L8.85 8l.62.62a.6.6 0 1 1-.85.85L8 8.85l-.62.62a.6.6 0 1 1-.85-.85L7.15 8l-.62-.62a.6.6 0 0 1 0-.85"
            fill="currentColor"
          />
        </svg>
      </button>
    </template>
  </NDatePicker>
</template>

<style>
.zn-date-range__clear {
  display: flex;
  padding: 0;
  border: none;
  background: none;
  color: inherit;
  cursor: pointer;
  opacity: 0.7;
}

.zn-date-range__clear svg {
  width: 1em;
  height: 1em;
  fill: currentcolor;
}

.zn-date-range__clear:hover {
  opacity: 1;
}
</style>
