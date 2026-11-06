import type { ZnFormPath } from './context'
import { findUnsafePathSegment } from '../../shared/path'
import { getZnFormComponent } from './components'

/** schema 只含纯数据，可以存成 JSON */
export interface ZnFormFieldSchema {
  /** 组件名，见 `znFormComponents` */
  component: string
  /** 字段为空时填入的值，形状与 path 一致 */
  defaultValue?: unknown
  /** 显示在组件下方的说明 */
  help?: string
  /** 字段的稳定标识，供列表渲染和表单设计器选中、拖拽；不填时用下标 */
  id?: string
  label?: string
  path: ZnFormPath
  /** 透传给组件的 props */
  props?: Record<string, unknown>
  required?: boolean
  /** 占几列，应为正整数 */
  span?: number
}

export interface ZnFormSchema {
  /** 列数，应为正整数 */
  cols?: number
  fields: ZnFormFieldSchema[]
  version?: 1
}

export interface ZnFormSchemaIssue {
  /** 出问题的字段下标；schema 本身的问题（如 cols）没有下标 */
  index?: number
  message: string
}

/** 列数、占列数只认正整数：0、负数和小数都会拼出无效的 CSS，如 repeat(0, minmax(0, 1fr))、span 2.5 */
function isColumnCount(value: number): boolean {
  return Number.isInteger(value) && value > 0
}

function checkPath(field: ZnFormFieldSchema): string | undefined {
  const meta = getZnFormComponent(field.component)
  if (!meta) {
    return `未知组件 ${field.component}`
  }
  const { path } = field
  if (!meta.models) {
    return typeof path === 'string' && path !== ''
      ? undefined
      : `${field.component} 的 path 应为字符串`
  }
  const expected = meta.models.join('、')
  if (typeof path !== 'object' || path === null) {
    return `${field.component} 的 path 应为对象，包含 ${expected}`
  }
  const keys = Object.keys(path)
  const matches = keys.length === meta.models.length
    && meta.models.every(model => typeof path[model] === 'string' && path[model] !== '')
  return matches
    ? undefined
    : `${field.component} 的 path 应包含且只包含 ${expected}`
}

/** 检查 path 里是否有会污染原型的段；path 形状不对时跳过，由 checkPath 报 */
function checkUnsafePath(field: ZnFormFieldSchema): string | undefined {
  const dataPaths = toStringList(field.path)
  for (const dataPath of dataPaths) {
    const segment = findUnsafePathSegment(dataPath)
    if (segment !== undefined) {
      return `path 不能包含 ${segment}`
    }
  }
  return undefined
}

/** path 里的数据路径；非字符串的值不检查，形状问题由 checkPath 报 */
function toStringList(path: unknown): string[] {
  if (typeof path === 'string') {
    return [path]
  }
  if (typeof path !== 'object' || path === null) {
    return []
  }
  return Object.values(path).filter(value => typeof value === 'string')
}

/** 检查 schema 是否能正确渲染；返回空数组表示没有问题 */
export function validateZnFormSchema(schema: ZnFormSchema): ZnFormSchemaIssue[] {
  const issues: ZnFormSchemaIssue[] = []
  const ids = new Set<string>()
  if (schema.cols !== undefined && !isColumnCount(schema.cols)) {
    issues.push({ message: 'cols 应为正整数' })
  }
  schema.fields.forEach((field, index) => {
    const pathIssue = checkPath(field) ?? checkUnsafePath(field)
    if (pathIssue) {
      issues.push({ index, message: pathIssue })
    }
    if (field.span !== undefined && !isColumnCount(field.span)) {
      issues.push({ index, message: 'span 应为正整数' })
    }
    if (field.id !== undefined) {
      if (ids.has(field.id)) {
        issues.push({ index, message: `id ${field.id} 重复` })
      }
      ids.add(field.id)
    }
  })
  return issues
}
