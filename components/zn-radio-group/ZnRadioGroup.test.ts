import type { MockInstance } from 'vitest'
import { mount } from '@vue/test-utils'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { defineComponent, h, nextTick, ref } from 'vue'
import { ZnForm } from '../zn-form'
import { ZnFormItem } from '../zn-form-item'
import ZnRadioGroup from './ZnRadioGroup.vue'

let warn: MockInstance<typeof console.warn>

beforeEach(() => {
  warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
})

afterEach(() => {
  warn.mockRestore()
})

function mountChoice(initial: unknown) {
  const model = ref(initial)
  mount(defineComponent({
    render: () => h(ZnRadioGroup, {
      modelValue: model.value as never,
      'onUpdate:modelValue': (value: string | number | boolean | null) => {
        model.value = value
      },
    }),
  }))
  return model
}

describe('<ZnRadioGroup>', () => {
  it('rewrites a value that is not a string, number or boolean to null', async () => {
    const model = mountChoice({ unexpected: true })
    await nextTick()
    expect(model.value).toBeNull()
    expect(warn).toHaveBeenCalled()
  })

  it('rewrites NaN to null', async () => {
    const model = mountChoice(Number.NaN)
    await nextTick()
    expect(model.value).toBeNull()
  })

  it('keeps false, because it can be a real option', async () => {
    const data = ref<Record<string, unknown>>({ choice: false })
    const wrapper = mount(defineComponent({
      render: () => h(ZnForm, {
        modelValue: data.value,
        'onUpdate:modelValue': (value: Record<string, unknown>) => {
          data.value = value
        },
      }, () => h(ZnFormItem, { path: 'choice', label: '是否', required: true }, () => h(ZnRadioGroup, {
        modelValue: data.value.choice as boolean,
        'onUpdate:modelValue': (value: string | number | boolean | null) => {
          data.value = { ...data.value, choice: value }
        },
      }))),
    }))
    await nextTick()

    expect(data.value.choice).toBe(false)
    expect(warn).not.toHaveBeenCalled()
    await expect(wrapper.findComponent(ZnForm).vm.submit()).resolves.toBe(true)
  })
})
