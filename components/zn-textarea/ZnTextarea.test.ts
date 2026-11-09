import { mount } from '@vue/test-utils'
import { NInput } from 'naive-ui'
import { describe, expect, it } from 'vitest'
import { defineComponent, h, nextTick, ref } from 'vue'
import ZnTextarea from './ZnTextarea.vue'

describe('<ZnTextarea>', () => {
  it('keeps an empty string from the parent instead of rewriting it to null', async () => {
    const model = ref<string | null>('')
    const wrapper = mount(defineComponent({
      render: () => h(ZnTextarea, {
        modelValue: model.value,
        'onUpdate:modelValue': (value: string | null) => {
          model.value = value
        },
      }),
    }))
    await nextTick()
    expect(model.value).toBe('')
    expect(wrapper.findComponent(NInput).props('type')).toBe('textarea')
  })

  it('writes null when the user clears the textarea', async () => {
    const model = ref<string | null>('abc')
    const wrapper = mount(defineComponent({
      render: () => h(ZnTextarea, {
        modelValue: model.value,
        'onUpdate:modelValue': (value: string | null) => {
          model.value = value
        },
      }),
    }))
    await nextTick()

    await wrapper.find('textarea').setValue('')
    expect(model.value).toBeNull()
  })
})
