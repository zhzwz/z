import type { MockInstance } from 'vitest'
import { afterEach, beforeEach, expect, vi } from 'vitest'

/**
 * Vue 的 `warn` 只用于开发期提示（生产构建会剥掉），正常使用路径上不该出现。
 * 这里默认静音并断言没被调用。确实要断言告警的测试会自己再 `vi.spyOn` 一层覆盖本次的 spy，
 * 那种情况下本文件不重复断言，由测试自己负责。
 */
let warn: MockInstance<typeof console.warn> | undefined

beforeEach(() => {
  warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
})

afterEach(() => {
  const calls = warn?.mock.calls.map(args => args.map(String).join(' ')) ?? []
  const overridden = warn !== undefined && console.warn !== (warn as unknown as typeof console.warn)
  warn?.mockRestore()
  warn = undefined
  if (overridden) {
    return
  }
  expect(calls).toEqual([])
})
