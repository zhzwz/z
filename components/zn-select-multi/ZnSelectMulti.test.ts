import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import { defineComponent, h, nextTick, ref } from 'vue'
import ZnSelectMulti from './ZnSelectMulti.vue'

const options = [
  { label: '阅读', value: 'read' },
]

describe('<ZnSelectMulti>', () => {
  it('rewrites a non-array to an empty array', async () => {
    const model = ref<unknown>(null)
    mount(defineComponent({
      render: () => h(ZnSelectMulti, {
        modelValue: model.value as never,
        options,
        'onUpdate:modelValue': (value: string[]) => {
          model.value = value
        },
      }),
    }))
    await nextTick()
    expect(model.value).toEqual([])
  })

  it('keeps a value that is not in the options yet', async () => {
    const model = ref<unknown>(['pending'])
    mount(defineComponent({
      render: () => h(ZnSelectMulti, {
        modelValue: model.value as never,
        options,
        'onUpdate:modelValue': (next: string[]) => {
          model.value = next
        },
      }),
    }))
    await nextTick()
    expect(model.value).toEqual(['pending'])
    const settled = model.value
    await nextTick()
    expect(model.value).toBe(settled)
  })
})
