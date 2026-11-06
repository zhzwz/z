import { warn } from 'vue'

type Data = Record<string, unknown>

const isData = (value: unknown): value is Data => typeof value === 'object' && value !== null

/** 能顺着原型链改到全局对象的段，如 `setPath({}, '__proto__.polluted', 'yes')` */
const unsafeSegments = new Set(['__proto__', 'constructor', 'prototype'])

/** 返回路径里第一个会污染原型的段；路径安全时返回 undefined */
export function findUnsafePathSegment(path: string): string | undefined {
  return path.split('.').find(segment => unsafeSegments.has(segment))
}

const warnedPaths = new Set<string>()

/** 静默跳过会让使用方以为读写失灵，所以同一个 path 只提示一次 */
function warnUnsafePath(fn: string, path: string, segment: string) {
  if (warnedPaths.has(path)) {
    return
  }
  warnedPaths.add(path)
  warn(`[path] ${fn}("${path}") 已跳过：${segment} 会顺着原型链读写到全局对象。schema 里的 path 可以先用 validateZnFormSchema 检查。`)
}

/** 按点号路径取值，如 `contact.phone`；只读对象自身的属性，路径不安全时返回 undefined */
export function getPath(data: Data, path: string): unknown {
  const unsafe = findUnsafePathSegment(path)
  if (unsafe) {
    warnUnsafePath('getPath', path, unsafe)
    return undefined
  }
  let current: unknown = data
  for (const segment of path.split('.')) {
    if (!isData(current) || !Object.hasOwn(current, segment)) {
      return undefined
    }
    current = current[segment]
  }
  return current
}

/** 按点号路径写值，中间缺失的对象会自动创建；路径不安全时不写入 */
export function setPath(data: Data, path: string, value: unknown) {
  const unsafe = findUnsafePathSegment(path)
  if (unsafe) {
    warnUnsafePath('setPath', path, unsafe)
    return
  }
  const segments = path.split('.')
  const last = segments.pop()!
  let current = data
  for (const segment of segments) {
    if (!Object.hasOwn(current, segment) || !isData(current[segment])) {
      current[segment] = {}
    }
    current = current[segment] as Data
  }
  current[last] = value
}
