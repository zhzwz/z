import { format, isValid, parse } from 'date-fns'

export const dateFormat = 'yyyy-MM-dd'
export const dateTimeFormat = 'yyyy-MM-dd HH:mm:ss'

/** 能按 `valueFormat` 解析，且格式化回去与原字符串一致（排除 2 月 30 日这类会被顺延的日期） */
export function isDateText(value: unknown, valueFormat: string): value is string {
  if (typeof value !== 'string') {
    return false
  }
  const date = parse(value, valueFormat, new Date())
  return isValid(date) && format(date, valueFormat) === value
}
