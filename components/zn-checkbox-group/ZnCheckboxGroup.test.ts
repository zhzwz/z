import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import { defineComponent, h, nextTick, ref } from 'vue'
import { ZnForm } from '../zn-form'
import { ZnFormItem } from '../zn-form-item'
import ZnCheckboxGroup from './ZnCheckboxGroup.vue'

describe('<ZnCheckboxGroup>', () => {
  it('rewrites a non-array to an empty array', async () => {
    const model = ref<unknown>(null)
    mount(defineComponent({
      render: () => h(ZnCheckboxGroup, {
        modelValue: model.value as never,
        'onUpdate:modelValue': (value: (string | number)[]) => {
          model.value = value
        },
      }),
    }))
    await nextTick()
    expect(model.value).toEqual([])
  })

  it('keeps an array value and does not rewrite it again', async () => {
    const model = ref<unknown>(['read'])
    mount(defineComponent({
      render: () => h(ZnCheckboxGroup, {
        modelValue: model.value as never,
        'onUpdate:modelValue': (next: (string | number)[]) => {
          model.value = next
        },
      }),
    }))
    await nextTick()
    expect(model.value).toEqual(['read'])
    const settled = model.value
    await nextTick()
    expect(model.value).toBe(settled)
  })

  it('counts an empty array as empty for a required field', async () => {
    const data = ref<Record<string, unknown>>({ tags: [] })
    const wrapper = mount(defineComponent({
      render: () => h(ZnForm, {
        modelValue: data.value,
        'onUpdate:modelValue': (value: Record<string, unknown>) => {
          data.value = value
        },
      }, () => h(ZnFormItem, { path: 'tags', label: '标签', required: true }, () => h(ZnCheckboxGroup, {
        modelValue: data.value.tags as string[],
        'onUpdate:modelValue': (value: string[]) => {
          data.value = { ...data.value, tags: value }
        },
      }))),
    }))
    await nextTick()

    await expect(wrapper.findComponent(ZnForm).vm.submit()).resolves.toBe(false)
    await nextTick()
    expect(wrapper.text()).toContain('标签不能为空')
  })
})
