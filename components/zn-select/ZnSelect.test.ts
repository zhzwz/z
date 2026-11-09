import type { MockInstance } from 'vitest'
import { mount } from '@vue/test-utils'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { defineComponent, h, nextTick, ref } from 'vue'
import ZnSelect from './ZnSelect.vue'

let warn: MockInstance<typeof console.warn>

beforeEach(() => {
  warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
})

afterEach(() => {
  warn.mockRestore()
})

const options = [
  { label: '阅读', value: 'read' },
]

describe('<ZnSelect>', () => {
  it('rewrites a value that is not a string or number to null', async () => {
    const model = ref<unknown>(false)
    mount(defineComponent({
      render: () => h(ZnSelect, {
        modelValue: model.value as never,
        options,
        'onUpdate:modelValue': (value: string | number | null) => {
          model.value = value
        },
      }),
    }))
    await nextTick()
    expect(model.value).toBeNull()
    expect(warn).toHaveBeenCalled()
  })

  it('keeps a value that is not in the options yet', async () => {
    const model = ref<string | null>('pending')
    mount(defineComponent({
      render: () => h(ZnSelect, {
        modelValue: model.value,
        options,
        'onUpdate:modelValue': (value: string | null) => {
          model.value = value
        },
      }),
    }))
    await nextTick()
    expect(model.value).toBe('pending')
    expect(warn).not.toHaveBeenCalled()
  })
})
