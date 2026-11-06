import type { Ref } from 'vue'

type AnyFunction = (...args: unknown[]) => unknown

/** 把子组件实例的方法转发出去，用于 `defineExpose`；子组件挂载前调用不做任何事。 */
export function forwardMethods<T extends object, K extends keyof T>(target: Readonly<Ref<T | null>>, keys: readonly K[]) {
  const methods = {} as Pick<T, K>
  for (const key of keys) {
    methods[key] = ((...args: unknown[]) => (target.value?.[key] as AnyFunction | undefined)?.(...args)) as T[K]
  }
  return methods
}
