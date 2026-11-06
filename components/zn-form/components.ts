import type { Component } from 'vue'
import { ZnCheckbox } from '../zn-checkbox'
import { ZnCheckboxGroup } from '../zn-checkbox-group'
import { ZnDate } from '../zn-date'
import { ZnDateRange } from '../zn-date-range'
import { ZnDateTime } from '../zn-date-time'
import { ZnInput } from '../zn-input'
import { ZnInputNumber } from '../zn-input-number'
import { ZnRadioGroup } from '../zn-radio-group'
import { ZnSelect } from '../zn-select'
import { ZnSelectMulti } from '../zn-select-multi'
import { ZnSwitch } from '../zn-switch'
import { ZnTextarea } from '../zn-textarea'

export interface ZnFormComponentMeta {
  component: Component
  /** 具名 v-model 的模型名；不填表示只有 `v-model`，schema 里的 path 写字符串 */
  models?: readonly string[]
  /** 显示名，供表单设计器列出可用组件 */
  title: string
}

export type ZnFormComponentName
  = | 'ZnCheckbox'
    | 'ZnCheckboxGroup'
    | 'ZnDate'
    | 'ZnDateRange'
    | 'ZnDateTime'
    | 'ZnInput'
    | 'ZnInputNumber'
    | 'ZnRadioGroup'
    | 'ZnSelect'
    | 'ZnSelectMulti'
    | 'ZnSwitch'
    | 'ZnTextarea'

/** schema 里 `component` 可用的组件 */
export const znFormComponents: Readonly<Record<ZnFormComponentName, ZnFormComponentMeta>> = {
  ZnCheckbox: { title: '勾选框', component: ZnCheckbox },
  ZnCheckboxGroup: { title: '多选组', component: ZnCheckboxGroup },
  ZnDate: { title: '日期', component: ZnDate },
  ZnDateRange: {
    title: '日期范围',
    component: ZnDateRange,
    models: ['start', 'end'],
  },
  ZnDateTime: { title: '日期时间', component: ZnDateTime },
  ZnInput: { title: '单行文本', component: ZnInput },
  ZnInputNumber: { title: '数字', component: ZnInputNumber },
  ZnRadioGroup: { title: '单选组', component: ZnRadioGroup },
  ZnSelect: { title: '下拉单选', component: ZnSelect },
  ZnSelectMulti: { title: '下拉多选', component: ZnSelectMulti },
  ZnSwitch: { title: '开关', component: ZnSwitch },
  ZnTextarea: { title: '多行文本', component: ZnTextarea },
}

export function getZnFormComponent(name: string): ZnFormComponentMeta | undefined {
  return Object.hasOwn(znFormComponents, name)
    ? znFormComponents[name as ZnFormComponentName]
    : undefined
}
