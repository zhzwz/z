import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import { defineComponent, h, nextTick, ref } from 'vue'
import { ZnForm } from '../zn-form'
import { ZnFormItem } from '../zn-form-item'
import ZnSwitch from './ZnSwitch.vue'

describe('<ZnSwitch>', () => {
  it('rewrites null to false', async () => {
    const model = ref<unknown>(null)
    mount(defineComponent({
      render: () => h(ZnSwitch, {
        modelValue: model.value as never,
        'onUpdate:modelValue': (value: boolean) => {
          model.value = value
        },
      }),
    }))
    await nextTick()
    expect(model.value).toBe(false)
  })

  it('counts as empty for a required field', async () => {
    const data = ref<Record<string, unknown>>({ on: false })
    const wrapper = mount(defineComponent({
      render: () => h(ZnForm, {
        modelValue: data.value,
        'onUpdate:modelValue': (value: Record<string, unknown>) => {
          data.value = value
        },
      }, () => h(ZnFormItem, { path: 'on', label: '启用', required: true }, () => h(ZnSwitch, {
        modelValue: data.value.on as boolean,
        'onUpdate:modelValue': (value: boolean) => {
          data.value = { ...data.value, on: value }
        },
      }))),
    }))
    await nextTick()

    await expect(wrapper.findComponent(ZnForm).vm.submit()).resolves.toBe(false)
    await nextTick()
    expect(wrapper.text()).toContain('启用不能为空')
  })
})
