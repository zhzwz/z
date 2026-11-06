/**
 * 文本类组件的值：字符串原样保留（包括空字符串），其他类型回写为 `null`。
 *
 * `''` 不改成 `null`：它可能是使用方回填的原始数据（有些后端用空字符串表示"有字段但为空"），
 * 挂载时就地改写数据既意外又不可逆。用户主动清空时 naive 发的是 `''`，由组件自己写成 `null`。
 */
export function toTextValue(value: unknown) {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return String(value)
  }
  return typeof value === 'string'
    ? value
    : null
}
