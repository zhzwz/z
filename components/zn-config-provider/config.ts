import type { ComputedRef, InjectionKey } from 'vue'
import type { ZnButtonProps } from '../zn-button'
import type { ZnCheckboxProps } from '../zn-checkbox'
import type { ZnCheckboxGroupProps } from '../zn-checkbox-group'
import type { ZnDateProps } from '../zn-date'
import type { ZnDateRangeProps } from '../zn-date-range'
import type { ZnDateTimeProps } from '../zn-date-time'
import type { ZnFormProps } from '../zn-form'
import type { ZnFormItemProps } from '../zn-form-item'
import type { ZnInputProps } from '../zn-input'
import type { ZnInputNumberProps } from '../zn-input-number'
import type { ZnRadioGroupProps } from '../zn-radio-group'
import type { ZnScrollbarProps } from '../zn-scrollbar'
import type { ZnSelectProps } from '../zn-select'
import type { ZnSelectMultiProps } from '../zn-select-multi'
import type { ZnSwitchProps } from '../zn-switch'
import type { ZnTextareaProps } from '../zn-textarea'
import { getCurrentInstance, inject } from 'vue'

export interface ZnComponentProps {
  ZnButton: ZnButtonProps
  ZnCheckbox: ZnCheckboxProps
  ZnCheckboxGroup: ZnCheckboxGroupProps
  ZnDate: ZnDateProps
  ZnDateRange: ZnDateRangeProps
  ZnDateTime: ZnDateTimeProps
  ZnForm: ZnFormProps
  ZnFormItem: ZnFormItemProps
  ZnInput: ZnInputProps
  ZnInputNumber: ZnInputNumberProps
  ZnRadioGroup: ZnRadioGroupProps
  ZnScrollbar: ZnScrollbarProps
  ZnSelect: ZnSelectProps
  ZnSelectMulti: ZnSelectMultiProps
  ZnSwitch: ZnSwitchProps
  ZnTextarea: ZnTextareaProps
}

/** 各组件的默认 props，按组件名配置 */
export type ZnDefaults = { [K in keyof ZnComponentProps]?: ZnComponentProps[K] }

export interface ZnConfig {
  defaults: ZnDefaults
}

export const znConfigKey: InjectionKey<ComputedRef<ZnConfig>> = Symbol('zn-config')

/** 最近一层 ZnConfigProvider 的配置；不在 ZnConfigProvider 里时为 null */
export function useZnConfig() {
  return inject(znConfigKey, null)
}

export function mergeDefaults(base: ZnDefaults, overrides: ZnDefaults | undefined): ZnDefaults {
  const merged: Record<string, object | undefined> = { ...base }
  for (const [name, defaults] of Object.entries(overrides ?? {})) {
    merged[name] = {
      ...merged[name],
      ...defaults,
    }
  }
  return merged as ZnDefaults
}

const hyphenate = (key: string) => key.replace(/\B([A-Z])/g, '-$1').toLowerCase()

/**
 * 父组件是否显式传了这个 prop。vnode props 只有传了才有这个键，与值无关：`null` 是有语义的值（naive 的
 * `theme`、`actions`、`locale` 等用 `null` 表达"关掉"），不能当成没传。
 *
 * 传 `undefined`（`v-bind` 展开一个缺省字段）视同没传，仍用默认值。
 */
function isPassed(passed: Record<string, unknown>, key: string) {
  const hyphenated = hyphenate(key)
  return (Object.hasOwn(passed, key) && passed[key] !== undefined)
    || (Object.hasOwn(passed, hyphenated) && passed[hyphenated] !== undefined)
}

/**
 * 合并 ZnConfigProvider 配置的默认 props：组件上显式传的 prop 优先，没传的才用默认值。
 *
 * 只输出 `declaredProps`（组件声明给 naive 的 props 对象，如 `znInputProps`）里的键。`defineModel` 生成的
 * `modelValue`、`start` 等以及 `modelModifiers` 不在其中：naive 不声明这些键，透传下去会作为 fallthrough attrs
 * 落到根元素上，SSR 时还会写进 HTML 响应体。
 *
 * 返回函数而不是 computed，需在渲染时调用：是否显式传了 prop 要看父组件这次渲染传入的 vnode props，它不是响应式的。
 */
export function useZnDefaults<P extends object, D extends Record<string, unknown>>(
  name: keyof ZnComponentProps,
  props: P,
  declaredProps: D,
): () => Pick<P, Extract<keyof D, keyof P>> {
  const config = useZnConfig()
  const instance = getCurrentInstance()
  const keys = Object.keys(declaredProps)
  return () => {
    const values = props as Record<string, unknown>
    const resolved: Record<string, unknown> = {}
    for (const key of keys) {
      resolved[key] = values[key]
    }
    const defaults = config?.value.defaults[name] as Record<string, unknown> | undefined
    if (!defaults) {
      return resolved as Pick<P, Extract<keyof D, keyof P>>
    }
    const passed = instance?.vnode.props ?? {}
    // 只合并本组件声明给 naive 的键：`defaults` 可能来自外部配置，多余的键（如 `modelValue`、`multiple`、
    // `type`）一旦透传下去会落到 naive 上，改动组件的形态，甚至作为 attr 写进 DOM 和 SSR 输出。
    for (const key of keys) {
      if (!isPassed(passed, key) && defaults[key] !== undefined) {
        resolved[key] = defaults[key]
      }
    }
    return resolved as Pick<P, Extract<keyof D, keyof P>>
  }
}
