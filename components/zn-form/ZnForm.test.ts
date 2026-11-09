import type { FormItemRule } from 'naive-ui'
import type { ZnFormSchema } from './schema'
import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import { defineComponent, h, nextTick, ref } from 'vue'
import { ZnFormItem } from '../zn-form-item'
import { ZnInput } from '../zn-input'
import { ZnForm } from './index'

function mountForm(model: Record<string, unknown>) {
  const wrapper = mount(defineComponent({
    render: () => h(ZnForm, { modelValue: model }),
  }))
  return wrapper
}

function mountSchemaForm(model: Record<string, unknown>, schema: ZnFormSchema) {
  const wrapper = mount(defineComponent({
    render: () => h(ZnForm, { modelValue: model, schema }),
  }), { attachTo: document.body })
  return wrapper
}

const schema: ZnFormSchema = {
  fields: [
    {
      component: 'ZnInput',
      path: 'name',
      label: '名称',
      required: true,
    },
    {
      component: 'ZnInput',
      path: 'note',
      label: '备注',
    },
  ],
}

describe('<ZnForm>', () => {
  it('emits a deep copy on submit', async () => {
    const model = ref<Record<string, unknown>>({
      when: new Date('2026-01-01T00:00:00Z'),
      list: [
        { a: 1 },
      ],
      tags: new Set(['x']),
      zero: 0,
    })
    const wrapper = mountForm(model.value)
    await wrapper.findComponent(ZnForm).vm.submit()

    const [[data]] = wrapper.findComponent(ZnForm).emitted('submit') as [[Record<string, unknown>]]
    expect(data).toEqual(model.value)
    expect(data).not.toBe(model.value)
    expect(data.when).toBeInstanceOf(Date)
    expect(data.tags).toBeInstanceOf(Set)
    expect(data.list).not.toBe(model.value.list)
  })

  it('emits a model with circular references', async () => {
    const model: Record<string, unknown> = { a: 1 }
    model.self = model
    const wrapper = mountForm(model)
    await wrapper.findComponent(ZnForm).vm.submit()

    const [[data]] = wrapper.findComponent(ZnForm).emitted('submit') as [[Record<string, unknown>]]
    expect(data.self).toBe(data)
  })

  describe('validate', () => {
    it('validates every item without paths', async () => {
      const wrapper = mountSchemaForm({ note: 'x' }, schema)
      await nextTick()

      await expect(wrapper.findComponent(ZnForm).vm.validate()).rejects.toBeTruthy()
      wrapper.unmount()
    })

    it('validates only the items bound to the given paths', async () => {
      const wrapper = mountSchemaForm({ note: 'x' }, schema)
      await nextTick()

      await expect(wrapper.findComponent(ZnForm).vm.validate(['note'])).resolves.toBeUndefined()
      await expect(wrapper.findComponent(ZnForm).vm.validate(['name'])).rejects.toBeTruthy()
      wrapper.unmount()
    })

    it('rejects when no item is bound to the given path', async () => {
      const wrapper = mountSchemaForm({ name: 'x' }, schema)
      await nextTick()

      await expect(wrapper.findComponent(ZnForm).vm.validate(['nope']))
        .rejects
        .toThrow('没有表单项绑定这些数据路径：nope')
      wrapper.unmount()
    })

    it('rejects an empty path list instead of passing silently', async () => {
      const wrapper = mountSchemaForm({}, schema)
      await nextTick()

      await expect(wrapper.findComponent(ZnForm).vm.validate([]))
        .rejects
        .toThrow('validate([]) 不会校验任何字段')
      wrapper.unmount()
    })
  })

  describe('cols', () => {
    it.each([
      [
        'cols 为 0',
        { cols: 0 },
        1,
      ],
      [
        'cols 为负数',
        { cols: -2 },
        1,
      ],
      [
        'cols 为小数',
        { cols: 2.5 },
        2,
      ],
      [
        'cols 为 NaN',
        { cols: Number.NaN },
        1,
      ],
      ['不传 cols', {}, 1],
    ])('%s 时输出合法列数', async (_, formProps, expected) => {
      const wrapper = mount(defineComponent({
        render: () => h(ZnForm, { modelValue: {}, ...formProps }),
      }))
      await nextTick()

      expect(wrapper.find('form').attributes('style')).toContain(`--zn-form-cols: ${expected}`)
      wrapper.unmount()
    })

    it('按 schema 里的值覆盖 cols', async () => {
      const wrapper = mount(defineComponent({
        render: () => h(ZnForm, {
          modelValue: {},
          cols: 2,
          schema: { cols: 3, fields: [] },
        }),
      }))
      await nextTick()

      expect(wrapper.find('form').attributes('style')).toContain('--zn-form-cols: 3')
      wrapper.unmount()
    })
  })
})

describe('<ZnForm> model updates', () => {
  const schema: ZnFormSchema = {
    fields: [
      { component: 'ZnInput', path: 'name' },
    ],
  }

  it('emits update:modelValue when a schema field changes the data', async () => {
    const data = ref<Record<string, unknown>>({ name: '' })
    const wrapper = mount(defineComponent({
      render: () => h(ZnForm, {
        modelValue: data.value,
        'onUpdate:modelValue': (value: Record<string, unknown>) => {
          data.value = value
        },
        schema,
      }),
    }), { attachTo: document.body })
    await nextTick()

    await wrapper.find('input').setValue('新值')
    await nextTick()
    expect(data.value).toEqual({ name: '新值' })
    wrapper.unmount()
  })

  it('keeps the change when the parent passes a fresh object every render', async () => {
    const data = ref<Record<string, unknown>>({ name: '' })
    const wrapper = mount(defineComponent({
      render: () => h(ZnForm, {
        // 不可变写法：每次渲染都生成新对象
        modelValue: { ...data.value },
        'onUpdate:modelValue': (value: Record<string, unknown>) => {
          data.value = value
        },
        schema,
      }),
    }), { attachTo: document.body })
    await nextTick()

    await wrapper.find('input').setValue('新值')
    await nextTick()
    expect(data.value).toEqual({ name: '新值' })
    expect((wrapper.find('input').element as HTMLInputElement).value).toBe('新值')
    wrapper.unmount()
  })

  it('reset writes back through update:modelValue', async () => {
    const data = ref<Record<string, unknown>>({ name: '旧值' })
    const wrapper = mount(defineComponent({
      render: () => h(ZnForm, {
        modelValue: { ...data.value },
        'onUpdate:modelValue': (value: Record<string, unknown>) => {
          data.value = value
        },
        schema: {
          fields: [
            { component: 'ZnInput', path: 'name', defaultValue: '预设' },
          ],
        },
      }),
    }), { attachTo: document.body })
    await nextTick()

    wrapper.findComponent(ZnForm).vm.reset()
    await nextTick()
    expect(data.value).toEqual({ name: '预设' })
    wrapper.unmount()
  })
})

describe('<ZnForm> rules on an object path', () => {
  function mountRange(data: Record<string, unknown>, rules: Record<string, FormItemRule | FormItemRule[]>) {
    const model = ref(data)
    return mount(defineComponent({
      render: () => h(ZnForm, {
        modelValue: model.value,
        'onUpdate:modelValue': (value: Record<string, unknown>) => {
          model.value = value
        },
        rules,
      }, () => h(ZnFormItem, {
        path: { start: 'from', end: 'to' },
        label: '有效期',
      }, () => h(ZnInput, { modelValue: null }))),
    }), { attachTo: document.body })
  }

  it('runs the required shorthand and shows its message', async () => {
    const wrapper = mountRange({ from: null, to: '2024-01-02' }, {
      from: { required: true, message: '需要开始日期' },
    })
    await nextTick()

    await expect(wrapper.findComponent(ZnForm).vm.submit()).resolves.toBe(false)
    await nextTick()
    expect(wrapper.text()).toContain('需要开始日期')
    wrapper.unmount()
  })

  it('hides the message when the rule is satisfied', async () => {
    const wrapper = mountRange({ from: '2024-01-01', to: '2024-01-02' }, {
      from: { required: true, message: '需要开始日期' },
    })
    await nextTick()

    await expect(wrapper.findComponent(ZnForm).vm.submit()).resolves.toBe(true)
    expect(wrapper.text()).not.toContain('需要开始日期')
    wrapper.unmount()
  })

  it('gives the rule the value of the path instead of undefined', async () => {
    const seen: unknown[] = []
    const wrapper = mountRange({ from: 'abc', to: null }, {
      from: {
        validator: (_rule: unknown, value: unknown) => {
          seen.push(value)
          return true
        },
      },
    })
    await nextTick()

    await expect(wrapper.findComponent(ZnForm).vm.submit()).resolves.toBe(true)
    expect(seen).toEqual(['abc'])
    wrapper.unmount()
  })

  it('reads an error passed to the validator callback', async () => {
    const wrapper = mountRange({ from: 'abc', to: null }, {
      from: {
        validator: (_rule, _value, callback) => {
          callback(new Error('回调报错'))
        },
      },
    })
    await nextTick()

    await expect(wrapper.findComponent(ZnForm).vm.submit()).resolves.toBe(false)
    await nextTick()
    expect(wrapper.text()).toContain('回调报错')
    wrapper.unmount()
  })

  it('waits for an error passed to the validator callback after the function returns', async () => {
    const wrapper = mountRange({ from: 'abc', to: null }, {
      from: {
        validator: (_rule, _value, callback) => {
          setTimeout(() => callback(new Error('晚一点报错')))
        },
      },
    })
    await nextTick()

    await expect(wrapper.findComponent(ZnForm).vm.submit()).resolves.toBe(false)
    await nextTick()
    expect(wrapper.text()).toContain('晚一点报错')
    wrapper.unmount()
  })

  it('passes when a validator neither returns nor takes a callback', async () => {
    const wrapper = mountRange({ from: 'abc', to: null }, {
      from: {
        validator: () => {},
      },
    })
    await nextTick()

    await expect(wrapper.findComponent(ZnForm).vm.submit()).resolves.toBe(true)
    wrapper.unmount()
  })

  it('rejects when the validator promise rejects', async () => {
    const wrapper = mountRange({ from: 'abc', to: null }, {
      from: {
        validator: () => Promise.reject(new Error('异步失败')),
      },
    })
    await nextTick()

    await expect(wrapper.findComponent(ZnForm).vm.submit()).resolves.toBe(false)
    await nextTick()
    expect(wrapper.text()).toContain('异步失败')
    wrapper.unmount()
  })

  it('does not run a blur-only rule while the field is still being edited', async () => {
    let runs = 0
    const wrapper = mountRange({ from: 'abc', to: 'def' }, {
      from: {
        trigger: ['blur'],
        validator() {
          runs += 1
          return new Error('失焦才报')
        },
      },
    })
    await nextTick()

    await wrapper.find('input').setValue('xyz')
    await nextTick()
    expect(runs).toBe(0)
    expect(wrapper.text()).not.toContain('失焦才报')

    await expect(wrapper.findComponent(ZnForm).vm.submit()).resolves.toBe(false)
    await nextTick()
    expect(runs).toBeGreaterThan(0)
    expect(wrapper.text()).toContain('失焦才报')
    wrapper.unmount()
  })

  it('shows a warning without blocking submit', async () => {
    const wrapper = mountRange({ from: 'abc', to: 'def' }, {
      from: {
        level: 'warning',
        validator: () => new Error('只是提醒'),
      },
    })
    await nextTick()

    await expect(wrapper.findComponent(ZnForm).vm.submit()).resolves.toBe(true)
    await nextTick()
    expect(wrapper.text()).toContain('只是提醒')
    wrapper.unmount()
  })

  it('reports rule shapes it cannot run instead of passing silently', async () => {
    const wrapper = mountRange({ from: 'a', to: null }, {
      from: { min: 3, message: '太短' },
    })
    await nextTick()

    await expect(wrapper.findComponent(ZnForm).vm.submit()).resolves.toBe(false)
    await nextTick()
    expect(wrapper.text()).toContain('只支持')
    wrapper.unmount()
  })
})
