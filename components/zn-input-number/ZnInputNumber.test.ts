import type { MockInstance } from 'vitest'
import { mount } from '@vue/test-utils'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { defineComponent, h, nextTick, ref } from 'vue'
import ZnInputNumber from './ZnInputNumber.vue'

let warn: MockInstance<typeof console.warn>

beforeEach(() => {
  warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
})

afterEach(() => {
  warn.mockRestore()
})

function mountNumber(initial: unknown) {
  const model = ref(initial)
  mount(defineComponent({
    render: () => h(ZnInputNumber, {
      modelValue: model.value as never,
      'onUpdate:modelValue': (value: number | null) => {
        model.value = value
      },
    }),
  }))
  return model
}

describe('<ZnInputNumber>', () => {
  it('turns a numeric string into a number', async () => {
    const model = mountNumber('42')
    await nextTick()
    expect(model.value).toBe(42)
    expect(warn).toHaveBeenCalled()
  })

  it('keeps zero', async () => {
    const model = mountNumber(0)
    await nextTick()
    expect(model.value).toBe(0)
    expect(warn).not.toHaveBeenCalled()
  })

  it('rewrites a blank string or a non-finite number to null', async () => {
    const blank = mountNumber('')
    await nextTick()
    expect(blank.value).toBeNull()

    const infinite = mountNumber(Number.POSITIVE_INFINITY)
    await nextTick()
    expect(infinite.value).toBeNull()
    expect(warn).toHaveBeenCalled()
  })
})
