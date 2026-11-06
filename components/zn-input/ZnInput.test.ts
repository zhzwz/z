import { mount } from '@vue/test-utils'
import { NInput } from 'naive-ui'
import { describe, expect, it } from 'vitest'
import { defineComponent, h, nextTick, ref } from 'vue'
import ZnInput from './ZnInput.vue'

describe('<ZnInput>', () => {
  it('keeps an empty string from the parent instead of rewriting it to null', async () => {
    const model = ref<string | null>('')
    mount(defineComponent({
      render: () => h(ZnInput, {
        modelValue: model.value,
        'onUpdate:modelValue': (value: string | null) => {
          model.value = value
        },
      }),
    }))
    await nextTick()
    expect(model.value).toBe('')
  })

  it('writes null when the user clears the input', async () => {
    const model = ref<string | null>('abc')
    const wrapper = mount(defineComponent({
      render: () => h(ZnInput, {
        modelValue: model.value,
        'onUpdate:modelValue': (value: string | null) => {
          model.value = value
        },
      }),
    }))
    await nextTick()

    await wrapper.find('input').setValue('')
    expect(model.value).toBeNull()
  })

  it('keeps a number out of the model by turning it into text', async () => {
    const model = ref<string | null>('42')
    mount(defineComponent({
      render: () => h(ZnInput, {
        modelValue: model.value,
        'onUpdate:modelValue': (value: string | null) => {
          model.value = value
        },
      }),
    }))
    await nextTick()
    expect(model.value).toBe('42')
  })

  it('stays a single-line input when the defaults ask for a textarea', () => {
    const wrapper = mount(ZnInput, {
      props: { type: 'textarea' as never },
    })
    expect(wrapper.findComponent(NInput).props('type')).toBe('text')
    expect(wrapper.find('textarea').exists()).toBe(false)
  })
})
