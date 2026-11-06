import { toRaw } from 'vue'

type Seen = Map<object, unknown>

type BufferViewConstructor = new (buffer: ArrayBuffer) => ArrayBufferView

/**
 * 深拷贝数据，保留 Date、RegExp、Map、Set、TypedArray、ArrayBuffer、Blob/File 的类型，支持循环引用。
 * 类实例保留原型、只拷贝自身可枚举属性，依赖私有字段（`#x`）的实例拷出来不能用，这类值不要放进表单。
 */
export function cloneData<T>(value: T): T {
  return cloneValue(value, new Map()) as T
}

function cloneValue(value: unknown, seen: Seen): unknown {
  if (typeof value !== 'object' || value === null) {
    return value
  }
  const raw = toRaw(value)
  if (seen.has(raw)) {
    return seen.get(raw)
  }
  if (raw instanceof Date) {
    return new Date(raw.getTime())
  }
  if (raw instanceof RegExp) {
    return new RegExp(raw.source, raw.flags)
  }
  if (raw instanceof Map) {
    const copy = new Map()
    seen.set(raw, copy)
    for (const [key, item] of raw) {
      copy.set(cloneValue(key, seen), cloneValue(item, seen))
    }
    return copy
  }
  if (raw instanceof Set) {
    const copy = new Set()
    seen.set(raw, copy)
    for (const item of raw) {
      copy.add(cloneValue(item, seen))
    }
    return copy
  }
  if (ArrayBuffer.isView(raw)) {
    const buffer = raw.buffer.slice(raw.byteOffset, raw.byteOffset + raw.byteLength) as ArrayBuffer
    return new (raw.constructor as BufferViewConstructor)(buffer)
  }
  if (raw instanceof ArrayBuffer) {
    return raw.slice(0)
  }
  if (typeof Blob !== 'undefined' && raw instanceof Blob) {
    return typeof File !== 'undefined' && raw instanceof File
      ? new File([raw], raw.name, { type: raw.type, lastModified: raw.lastModified })
      : raw.slice(0, raw.size, raw.type)
  }
  if (Array.isArray(raw)) {
    const copy: unknown[] = []
    seen.set(raw, copy)
    for (const item of raw) {
      copy.push(cloneValue(item, seen))
    }
    return copy
  }
  const copy = Object.create(Object.getPrototypeOf(raw)) as Record<string, unknown>
  seen.set(raw, copy)
  for (const key of Object.keys(raw)) {
    copy[key] = cloneValue((raw as Record<string, unknown>)[key], seen)
  }
  return copy
}
