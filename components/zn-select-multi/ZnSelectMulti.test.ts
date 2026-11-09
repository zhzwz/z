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
        'onUpdate:modelValue': (value: (string | number)[]) => {
          model.value = value
        },
      }),
    }))
    await nextTick()
    expect(model.value).toEqual([])
  })

  it('drops entries that are not a string or a finite number', async () => {
    const model = ref<unknown>(['pending', null, Number.POSITIVE_INFINITY])
    mount(defineComponent({
      render: () => h(ZnSelectMulti, {
        modelValue: model.value as never,
        options,
        'onUpdate:modelValue': (next: (string | number)[]) => {
          model.value = next
        },
      }),
    }))
    await nextTick()
    expect(model.value).toEqual(['pending'])
  })

  it('keeps a value that is not in the options yet', async () => {
    const model = ref<unknown>(['pending'])
    mount(defineComponent({
      render: () => h(ZnSelectMulti, {
        modelValue: model.value as never,
        options,
        'onUpdate:modelValue': (next: (string | number)[]) => {
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
