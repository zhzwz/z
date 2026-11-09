import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import { defineComponent, h, nextTick, ref } from 'vue'
import ZnDateTime from './ZnDateTime.vue'

function mountDateTime(initial: unknown) {
  const model = ref(initial)
  mount(defineComponent({
    render: () => h(ZnDateTime, {
      modelValue: model.value as never,
      'onUpdate:modelValue': (value: string | null) => {
        model.value = value
      },
    }),
  }))
  return model
}

describe('<ZnDateTime>', () => {
  it('keeps a yyyy-MM-dd HH:mm:ss value', async () => {
    const model = mountDateTime('2024-01-01 08:30:00')
    await nextTick()
    expect(model.value).toBe('2024-01-01 08:30:00')
  })

  it('rewrites a date-only string to null', async () => {
    const model = mountDateTime('2024-01-01')
    await nextTick()
    expect(model.value).toBeNull()
  })
})
