import type { FormItemRule } from 'naive-ui'
import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import { defineComponent, h, nextTick, ref } from 'vue'
import { ZnForm } from '../zn-form'
import ZnFormItem from '../zn-form-item/ZnFormItem.vue'
import ZnDateRange from './ZnDateRange.vue'

function mountRange(model: { end: string | null, start: string | null }, props: Record<string, unknown> = {}) {
  const data = ref(model)
  const wrapper = mount(defineComponent({
    render: () => h(ZnDateRange, {
      ...props,
      start: data.value.start,
      end: data.value.end,
      'onUpdate:start': (value: string | null) => (data.value = { ...data.value, start: value }),
      'onUpdate:end': (value: string | null) => (data.value = { ...data.value, end: value }),
    }),
  }))
  return { data, wrapper }
}

function inputs(wrapper: ReturnType<typeof mountRange>['wrapper']) {
  return wrapper.findAll('input').map(input => input.element.value)
}

function mountForm(model: Record<string, unknown>, rules: FormItemRule[] = []) {
  const data = ref(model)
  const wrapper = mount(defineComponent({
    render: () => h(ZnForm, {
      modelValue: data.value,
      'onUpdate:modelValue': (value: Record<string, unknown>) => {
        data.value = value
      },
    }, () => h(ZnFormItem, {
      path: { start: 'from', end: 'to' },
      label: '有效期',
      rules,
    }, () => h(ZnDateRange, {
      start: data.value.from as string | null,
      end: data.value.to as string | null,
      'onUpdate:start': (value: string | null) => (data.value = { ...data.value, from: value }),
      'onUpdate:end': (value: string | null) => (data.value = { ...data.value, to: value }),
    }))),
  }), { attachTo: document.body })
  return {
    data,
    form: wrapper.findComponent(ZnForm),
    wrapper,
  }
}

async function flush() {
  await nextTick()
  await new Promise(resolve => setTimeout(resolve))
  await nextTick()
}

describe('<ZnDateRange>', () => {
  it('shows both ends', async () => {
    const { wrapper } = mountRange({ start: '2024-01-01', end: '2024-01-02' })
    await nextTick()
    expect(inputs(wrapper)).toEqual(['2024-01-01', '2024-01-02'])
  })

  it('keeps the other end when only one end is assigned per tick', async () => {
    const { data, wrapper } = mountRange({ start: null, end: null })
    await nextTick()

    data.value = { start: '2024-01-01', end: null }
    await nextTick()
    data.value = { start: '2024-01-01', end: '2024-01-02' }
    await nextTick()

    expect(data.value).toEqual({ start: '2024-01-01', end: '2024-01-02' })
    expect(inputs(wrapper)).toEqual(['2024-01-01', '2024-01-02'])
  })

  it('keeps an end that arrives before the start', async () => {
    const { data } = mountRange({ start: null, end: '2024-01-02' })
    await nextTick()
    expect(data.value).toEqual({ start: null, end: '2024-01-02' })
  })

  it('blanks the picker but keeps the value when only one end is set', async () => {
    const { data, wrapper } = mountRange({ start: '2024-01-01', end: null })
    await nextTick()
    expect(inputs(wrapper)).toEqual(['', ''])
    expect(data.value).toEqual({ start: '2024-01-01', end: null })
  })

  it.each(['', '2024-02-30', 'x'])('rewrites the invalid end %o to null', async (end) => {
    const { data } = mountRange({ start: null, end })
    await nextTick()
    expect(data.value.end).toBeNull()
  })

  it('rewrites both ends to null when a clear comes from the picker', async () => {
    const { data, wrapper } = mountRange({ start: '2024-01-01', end: '2024-01-02' })
    await nextTick()
    const picker = wrapper.findComponent({ name: 'DatePicker' })
    picker.vm.$emit('update:formatted-value', null)
    await nextTick()
    expect(data.value).toEqual({ start: null, end: null })
  })

  describe('in a form', () => {
    it('reports a missing end on submit', async () => {
      const { form, data } = mountForm({ from: '2024-01-01', to: null })
      await nextTick()

      await expect(form.vm.submit()).resolves.toBe(false)
      expect(data.value).toEqual({ from: '2024-01-01', to: null })
      expect(form.text()).toContain('开始和结束日期需要同时填写')
    })

    it('reports a start later than the end on submit', async () => {
      const { form } = mountForm({ from: '2024-01-02', to: '2024-01-01' })
      await nextTick()

      await expect(form.vm.submit()).resolves.toBe(false)
      expect(form.text()).toContain('开始日期不能晚于结束日期')
      expect(form.text()).not.toContain('需要同时填写')
    })

    it('passes with both ends filled in order', async () => {
      const { form } = mountForm({ from: '2024-01-01', to: '2024-01-02' })
      await nextTick()

      await expect(form.vm.submit()).resolves.toBe(true)
    })

    it('lets one end arrive after the other without losing it', async () => {
      const { form, data } = mountForm({ from: null, to: null })
      await nextTick()

      data.value = { from: '2024-01-01', to: null }
      await nextTick()
      data.value = { from: '2024-01-01', to: '2024-01-02' }
      await nextTick()

      await expect(form.vm.submit()).resolves.toBe(true)
    })

    it('does not show an error before the form is validated', async () => {
      const { form } = mountForm({ from: '2024-01-01', to: null })
      await nextTick()
      expect(form.text()).not.toContain('开始和结束日期需要同时填写')

      await form.vm.validate().catch(() => {})
      await nextTick()
      expect(form.text()).toContain('开始和结束日期需要同时填写')
    })

    it('refreshes the feedback when a validated item changes from outside', async () => {
      const { form, data } = mountForm({ from: '2024-01-02', to: '2024-01-01' })
      await nextTick()
      await form.vm.validate().catch(() => {})
      await nextTick()
      expect(form.text()).toContain('开始日期不能晚于结束日期')

      data.value = { from: '2024-01-01', to: '2024-01-02' }
      await flush()
      expect(form.text()).not.toContain('开始日期不能晚于结束日期')
    })

    it('clears the feedback on reset without validating again', async () => {
      const { form } = mountForm({ from: '2024-01-02', to: '2024-01-01' })
      await nextTick()
      await form.vm.validate().catch(() => {})

      form.vm.reset()
      await nextTick()
      expect(form.text()).not.toContain('开始日期不能晚于结束日期')
    })
  })
})

describe('<ZnDateRange> half-filled', () => {
  it('offers a clear button that empties both ends', async () => {
    const { data, wrapper } = mountRange({ start: '2024-01-01', end: null }, { clearable: true })
    await nextTick()

    const clear = wrapper.find('.zn-date-range__clear')
    expect(clear.exists()).toBe(true)
    await clear.trigger('click')
    expect(data.value).toEqual({ start: null, end: null })
  })

  it('hides the clear button when both ends are filled', async () => {
    const { wrapper } = mountRange({ start: '2024-01-01', end: '2024-01-02' }, { clearable: true })
    await nextTick()
    expect(wrapper.find('.zn-date-range__clear').exists()).toBe(false)
  })

  it('hides the clear button without clearable', async () => {
    const data = ref({ start: '2024-01-01' as string | null, end: null as string | null })
    const wrapper = mount(defineComponent({
      render: () => h(ZnDateRange, {
        start: data.value.start,
        end: data.value.end,
        clearable: false,
        'onUpdate:start': (value: string | null) => (data.value = { ...data.value, start: value }),
        'onUpdate:end': (value: string | null) => (data.value = { ...data.value, end: value }),
      }),
    }))
    await nextTick()
    expect(wrapper.find('.zn-date-range__clear').exists()).toBe(false)
  })
})

describe('<ZnDateRange> revalidation', () => {
  it('keeps the error of a rule that only runs on blur when the value changes from outside', async () => {
    const rule: FormItemRule = {
      trigger: ['blur'],
      validator: () => new Error('这段日期不可用'),
    }
    const { data, form } = mountForm({ from: '2024-01-01', to: '2024-01-02' }, [rule])
    await flush()
    await form.vm.validate().catch(() => {})
    await flush()
    expect(form.text()).toContain('这段日期不可用')

    // 外部回填新值：revalidate 必须把这条 blur 规则也算进去，否则报错会被静默清掉
    data.value = { from: '2024-02-01', to: '2024-02-02' }
    await flush()
    expect(form.text()).toContain('这段日期不可用')
  })
})
