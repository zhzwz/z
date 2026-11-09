// 以使用方的身份对产物做类型检查，见 test/dist.test.ts。
import type { ZFlexProps } from '@zhzwz/z/components/z-flex'
import type { ZIconProps } from '@zhzwz/z/components/z-icon'
import type { ZnButtonProps } from '@zhzwz/z/components/zn-button'
import type { ZnDefaults } from '@zhzwz/z/components/zn-config-provider'
import type { ZnFormSchema } from '@zhzwz/z/components/zn-form'
import type { ZnInputProps } from '@zhzwz/z/components/zn-input'
import type { ZnSelectOption, ZnSelectProps, ZnSelectValue } from '@zhzwz/z/components/zn-select'
import { ZFlex } from '@zhzwz/z/components/z-flex'
import { ZIcon } from '@zhzwz/z/components/z-icon'
import { ZnButton } from '@zhzwz/z/components/zn-button'
import { ZnCheckbox } from '@zhzwz/z/components/zn-checkbox'
import { ZnCheckboxGroup } from '@zhzwz/z/components/zn-checkbox-group'
import { ZnConfigProvider } from '@zhzwz/z/components/zn-config-provider'
import { ZnDate } from '@zhzwz/z/components/zn-date'
import { ZnDateRange } from '@zhzwz/z/components/zn-date-range'
import { ZnDateTime } from '@zhzwz/z/components/zn-date-time'
import { validateZnFormSchema, ZnForm } from '@zhzwz/z/components/zn-form'
import { ZnFormField } from '@zhzwz/z/components/zn-form-field'
import { ZnFormItem } from '@zhzwz/z/components/zn-form-item'
import { ZnInput } from '@zhzwz/z/components/zn-input'
import { ZnInputNumber } from '@zhzwz/z/components/zn-input-number'
import { ZnRadioGroup } from '@zhzwz/z/components/zn-radio-group'
import { ZnScrollbar } from '@zhzwz/z/components/zn-scrollbar'
import { ZnSelect } from '@zhzwz/z/components/zn-select'
import { ZnSelectMulti } from '@zhzwz/z/components/zn-select-multi'
import { ZnSwitch } from '@zhzwz/z/components/zn-switch'
import { ZnTextarea } from '@zhzwz/z/components/zn-textarea'

export const components = [
  ZFlex,
  ZIcon,
  ZnButton,
  ZnCheckbox,
  ZnCheckboxGroup,
  ZnConfigProvider,
  ZnDate,
  ZnDateRange,
  ZnDateTime,
  ZnForm,
  ZnFormField,
  ZnFormItem,
  ZnInput,
  ZnInputNumber,
  ZnRadioGroup,
  ZnScrollbar,
  ZnSelect,
  ZnSelectMulti,
  ZnSwitch,
  ZnTextarea,
]

export const flexProps: ZFlexProps = { gap: 0.5, place: 'between center' }
export const iconProps: ZIconProps = { icon: 'ic:round-add' }
export const znButtonProps: ZnButtonProps = { icon: 'ic:round-add', label: '新建', type: 'primary' }
export const znInputProps: ZnInputProps = { clearable: true, placeholder: '请输入', type: 'password' }
export const znSelectOption: ZnSelectOption = { label: '首页', value: 'home', icon: 'ic:round-home' }
export const znSelectValue: ZnSelectValue = 'home'

// @ts-expect-error label 只接受字符串
export const invalidZnButtonProps: ZnButtonProps = { label: 1 }

// @ts-expect-error 值由 v-model 绑定，不提供 value
export const invalidZnInputProps: ZnInputProps = { value: 'a' }

// @ts-expect-error 多行文本用 ZnTextarea
export const invalidZnInputType: ZnInputProps = { type: 'textarea' }

// @ts-expect-error 多选用 ZnSelectMulti
export const invalidZnSelectProps: ZnSelectProps = { multiple: true }

// @ts-expect-error place 只接受约定的对齐方式
export const invalidFlexProps: ZFlexProps = { place: 'middle' }

export const znDefaults: ZnDefaults = {
  ZnInput: { clearable: false },
  ZnSelect: { filterable: true },
}

const invalidInputDefaults = { clearable: 'yes' } as const
// @ts-expect-error 默认值的类型来自各组件的 props
export const invalidZnDefaults: ZnDefaults = { ZnInput: invalidInputDefaults }

export const formSchema: ZnFormSchema = {
  cols: 2,
  fields: [
    {
      component: 'ZnInput',
      path: 'name',
      label: '名称',
      required: true,
    },
    {
      component: 'ZnDateRange',
      path: { start: 'startDate', end: 'endDate' },
      label: '有效期',
    },
  ],
}

export const formSchemaIssues = validateZnFormSchema(formSchema)
