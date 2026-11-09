import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import { defineComponent, h, nextTick, ref } from 'vue'
import ZnDate from './ZnDate.vue'

function mountDate(initial: unknown) {
  const model = ref(initial)
  mount(defineComponent({
    render: () => h(ZnDate, {
      modelValue: model.value as never,
      'onUpdate:modelValue': (value: string | null) => {
        model.value = value
      },
    }),
  }))
  return model
}

describe('<ZnDate>', () => {
  it('keeps a yyyy-MM-dd value', async () => {
    const model = mountDate('2024-01-01')
    await nextTick()
    expect(model.value).toBe('2024-01-01')
  })

  it('rewrites a date that does not match the stored format to null', async () => {
    const overflow = mountDate('2024-02-30')
    const dateTime = mountDate('2024-01-01 00:00:00')
    await nextTick()
    expect(overflow.value).toBeNull()
    expect(dateTime.value).toBeNull()
  })
})
