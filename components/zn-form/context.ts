import type { InjectionKey } from 'vue'
import { inject, onBeforeUnmount } from 'vue'

/**
 * 表单项绑定的数据路径：字符串对应组件的 `v-model`；
 * 对象对应具名 v-model，键是组件的模型名，值是数据路径，如 `{ start: 'startDate', end: 'endDate' }`。
 */
export type ZnFormPath = string | Record<string, string>

function isPathRecord(path: ZnFormPath | undefined): path is Record<string, string> {
  return typeof path === 'object' && path !== null
}

export function toDataPaths(path: ZnFormPath | undefined): string[] {
  if (typeof path === 'string') {
    return [path]
  }
  // schema 来自外部配置，path 可能是 null；这里不能抛，否则整张表渲染中断。
  return isPathRecord(path)
    ? Object.values(path)
    : []
}

/** 交给 NFormItem 的 path：多个数据路径时拼成一个不会命中数据的标识，取值由 ZnFormItem 自己完成 */
export function toItemPath(path: ZnFormPath | undefined): string | undefined {
  if (typeof path === 'string') {
    return path
  }
  return isPathRecord(path)
    ? Object.values(path).join(',')
    : undefined
}

/**
 * 判空用的默认空值。`false` 和 `''` 不在这里：只有两种状态的开关、勾选框用 `false` 表示关，
 * 而单选组、下拉里 `false` / `''` 可能是用户选中的真实选项。字段组件通过 `useZnFormItemEmptyValues` 声明自己的空值。
 */
export const defaultEmptyValues: readonly unknown[] = [undefined, null, '']

/** 空数组一律算未填，与 `defaultEmptyValues` 无关 */
export function isEmptyValue(value: unknown, emptyValues: readonly unknown[] = defaultEmptyValues) {
  return emptyValues.includes(value) || (Array.isArray(value) && value.length === 0)
}

/** 列数、占列数只认正整数：0、负数和小数都会拼出无效的 CSS，如 repeat(0, minmax(0, 1fr))、span 2.5 */
export function toColumnCount(value: unknown): number {
  return typeof value === 'number' && Number.isFinite(value)
    ? Math.max(1, Math.floor(value))
    : 1
}

export interface ZnFormItemEntry {
  dataPaths: string[]
  itemPath: string
  reset: () => void
}

export interface ZnFormContext {
  cols: () => number
  model: () => Record<string, unknown>
  /**
   * 就地改完 model 后调用：把新数据经 `update:modelValue` 交回使用方。
   * 使用方按不可变写法传 `modelValue` 时，靠这次 emit 改动才不会丢。
   */
  notifyChange: () => void
  register: (entry: ZnFormItemEntry) => () => void
  /** `NForm` 的 `rules`，按数据路径查；`path` 为对象时 naive 查不到，由 `ZnFormItem` 自己补 */
  rules: () => Record<string, unknown> | undefined
}

export const znFormKey: InjectionKey<ZnFormContext> = Symbol('zn-form')

/** 返回错误信息；没有问题时返回 undefined */
export type ZnFormItemCheck = () => string | undefined

export interface ZnFormItemContext {
  addCheck: (check: ZnFormItemCheck) => () => void
  /**
   * 重新校验所在的表单项，用于值被外部改变后刷新 feedback。
   * 表单项还没校验过时不做任何事：刚渲染、刚重置的表单不该立刻飘红。
   */
  revalidate: () => void
  /**
   * 声明本字段的空值。必填判断只看这些值（外加空数组）。
   * 只有两种状态的组件要带上 `false`，否则用户选「否」会被判成未填。
   */
  setEmptyValues: (emptyValues: readonly unknown[]) => void
}

export const znFormItemKey: InjectionKey<ZnFormItemContext> = Symbol('zn-form-item')

/**
 * 字段组件向所在的 ZnFormItem 声明自己的空值，如开关把 `false` 也算空。
 * 不在 ZnFormItem 里时不生效。
 */
export function useZnFormItemEmptyValues(emptyValues: readonly unknown[]) {
  const item = inject(znFormItemKey, null)
  item?.setEmptyValues(emptyValues)
}

/**
 * 字段组件向所在的 ZnFormItem 登记自带的校验，如日期范围的起止顺序；不在 ZnFormItem 里时不生效。
 * 返回值用来在值被外部改变（如接口回填）后刷新 feedback，同样只在 ZnFormItem 里生效。
 */
export function useZnFormItemCheck(check: ZnFormItemCheck) {
  const item = inject(znFormItemKey, null)
  if (item) {
    onBeforeUnmount(item.addCheck(check))
  }
  return () => item?.revalidate()
}
