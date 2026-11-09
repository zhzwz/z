const valuePropKeys = [
  'value',
  'defaultValue',
  'onUpdate:value',
  'onUpdateValue',
] as const

const checkedPropKeys = [
  'checked',
  'defaultChecked',
  'onUpdate:checked',
  'onUpdateChecked',
] as const

/** 值由 v-model 绑定、类型和存值格式由组件决定，这些 props 不对外提供 */
const datePickerValueKeys = [
  'value',
  'defaultValue',
  'formattedValue',
  'defaultFormattedValue',
  'onUpdate:value',
  'onUpdateValue',
  'onUpdate:formattedValue',
  'onUpdateFormattedValue',
  'type',
  'valueFormat',
] as const

const datePickerTimeKeys = [
  'defaultTime',
  'isTimeDisabled',
  'timePickerFormat',
  'timePickerProps',
] as const

const datePickerRangeKeys = [
  'startPlaceholder',
  'endPlaceholder',
  'separator',
  'ranges',
  'bindCalendarMonths',
  'defaultCalendarEndTime',
] as const

export const inputRemovedProps = [
  ...valuePropKeys,
  'pair',
  'separator',
  'rows',
  'resizable',
] as const

export const textareaRemovedProps = [
  ...valuePropKeys,
  'type',
  'pair',
  'separator',
  'showPasswordOn',
  'showPasswordToggle',
] as const

export const inputNumberRemovedProps = valuePropKeys

export const checkboxGroupRemovedProps = valuePropKeys

export const radioGroupRemovedProps = valuePropKeys

export const selectRemovedProps = [
  ...valuePropKeys,
  'multiple',
  'maxTagCount',
  'ellipsisTagPopoverProps',
  'renderTag',
] as const

export const selectMultiRemovedProps = [
  ...valuePropKeys,
  'multiple',
] as const

export const checkboxRemovedProps = [
  ...checkedPropKeys,
  'checkedValue',
  'uncheckedValue',
] as const

export const switchRemovedProps = [
  ...valuePropKeys,
  'checkedValue',
  'uncheckedValue',
] as const

export const dateRemovedProps = [
  ...datePickerValueKeys,
  ...datePickerTimeKeys,
  ...datePickerRangeKeys,
] as const

export const dateTimeRemovedProps = [
  ...datePickerValueKeys,
  ...datePickerRangeKeys,
] as const

export const dateRangeRemovedProps = [
  ...datePickerValueKeys,
  ...datePickerTimeKeys,
  'placeholder',
] as const

export const formRemovedProps = ['model', 'onSubmit'] as const

export const formItemRemovedProps = ['path', 'rule', 'rulePath'] as const
