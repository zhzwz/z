import type { MockInstance } from 'vitest'
import { mount } from '@vue/test-utils'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { defineComponent, h, nextTick, ref } from 'vue'
import { ZnForm } from '../zn-form'
import { ZnFormItem } from '../zn-form-item'
import ZnCheckbox from './ZnCheckbox.vue'

let warn: MockInstance<typeof console.warn>

beforeEach(() => {
  warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
})

afterEach(() => {
  warn.mockRestore()
})

function mountCheckbox(initial: unknown) {
  const model = ref(initial)
  mount(defineComponent({
    render: () => h(ZnCheckbox, {
      modelValue: model.value as never,
      'onUpdate:modelValue': (value: boolean) => {
        model.value = value
      },
    }),
  }))
  return model
}

describe('<ZnCheckbox>', () => {
  it('keeps true', async () => {
    const model = mountCheckbox(true)
    await nextTick()
    expect(model.value).toBe(true)
    expect(warn).not.toHaveBeenCalled()
  })

  it('rewrites null to false', async () => {
    const model = mountCheckbox(null)
    await nextTick()
    expect(model.value).toBe(false)
    expect(warn).not.toHaveBeenCalled()
  })

  it.each([1, 'x'])('rewrites %s to false', async (initial) => {
    const model = mountCheckbox(initial)
    await nextTick()
    expect(model.value).toBe(false)
    expect(warn).toHaveBeenCalled()
  })

  it('counts false as empty for a required field', async () => {
    const data = ref<Record<string, unknown>>({ agreed: false })
    const wrapper = mount(defineComponent({
      render: () => h(ZnForm, {
        modelValue: data.value,
        'onUpdate:modelValue': (value: Record<string, unknown>) => {
          data.value = value
        },
      }, () => h(ZnFormItem, { path: 'agreed', label: '同意', required: true }, () => h(ZnCheckbox, {
        modelValue: data.value.agreed as boolean,
        'onUpdate:modelValue': (value: boolean) => {
          data.value = { ...data.value, agreed: value }
        },
      }))),
    }))
    await nextTick()

    expect(warn).not.toHaveBeenCalled()
    await expect(wrapper.findComponent(ZnForm).vm.submit()).resolves.toBe(false)
    await nextTick()
    expect(wrapper.text()).toContain('同意不能为空')
  })
})
