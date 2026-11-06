import type { PropType } from 'vue'
import type { ZnDefaults } from '../zn-config-provider'
import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import { defineComponent, h, nextTick, ref } from 'vue'
import { ZnConfigProvider } from '../zn-config-provider'
import { ZnForm } from '../zn-form'
import { useZnFormItemEmptyValues } from '../zn-form/context'
import ZnFormItem from './ZnFormItem.vue'

function mountForm(defaults?: ZnDefaults, itemProps: Record<string, unknown> = {}) {
  const model = ref<Record<string, unknown>>({ name: 'a' })
  const wrapper = mount(defineComponent({
    render: () => h(ZnConfigProvider, { defaults }, () => h(ZnForm, {
      modelValue: model.value,
      'onUpdate:modelValue': (value: Record<string, unknown>) => {
        model.value = value
      },
    }, () => h(ZnFormItem, { path: 'name', ...itemProps }))),
  }))
  return { model, wrapper }
}

async function reset(wrapper: ReturnType<typeof mountForm>['wrapper']) {
  wrapper.findComponent(ZnForm).vm.reset()
  await nextTick()
}

describe('<ZnFormItem>', () => {
  it('resets to the default value passed as a prop', async () => {
    const { model, wrapper } = mountForm(undefined, { defaultValue: '预设' })
    await reset(wrapper)
    expect(model.value.name).toBe('预设')
  })

  it('resets to the default value of ZnConfigProvider.defaults', async () => {
    const { model, wrapper } = mountForm({
      ZnFormItem: { defaultValue: '预设' },
    })
    await reset(wrapper)
    expect(model.value.name).toBe('预设')
  })

  it('prefers the default value passed as a prop over ZnConfigProvider.defaults', async () => {
    const { model, wrapper } = mountForm({
      ZnFormItem: { defaultValue: '配置' },
    }, { defaultValue: '预设' })
    await reset(wrapper)
    expect(model.value.name).toBe('预设')
  })

  it.each([
    ['空字符串', ''],
    ['false', false],
    ['空数组', []],
    ['null', null],
    ['undefined', undefined],
  ])('fills the default value over %s', async (_, current) => {
    const { model, wrapper } = mountForm(undefined, { defaultValue: '预设' })
    model.value.name = current
    await reset(wrapper)
    expect(model.value.name).toBe('预设')
  })

  it('fills the default value of every model of an object path', async () => {
    const model = ref<Record<string, unknown>>({
      rangeStart: '',
      rangeEnd: null,
    })
    const wrapper = mount(defineComponent({
      render: () => h(ZnForm, {
        modelValue: model.value,
        'onUpdate:modelValue': (value: Record<string, unknown>) => {
          model.value = value
        },
      }, () => h(ZnFormItem, {
        path: { start: 'rangeStart', end: 'rangeEnd' },
        defaultValue: { start: '2024-01-01', end: '2024-01-02' },
      })),
    }))
    wrapper.findComponent(ZnForm).vm.reset()
    await nextTick()
    expect(model.value).toMatchObject({ rangeStart: '2024-01-01', rangeEnd: '2024-01-02' })
  })

  it('empties a single-value field to null when there is no default value', async () => {
    const { model, wrapper } = mountForm()
    model.value.name = 'abc'
    await reset(wrapper)
    expect(model.value.name).toBeNull()
  })

  it('empties a multi-value field to an empty array instead of null', async () => {
    const { model, wrapper } = mountForm()
    model.value.name = ['a']
    await reset(wrapper)
    expect(model.value.name).toEqual([])
  })

  it('empties a two-state field to false instead of null', async () => {
    const { model, wrapper } = mountForm()
    model.value.name = true
    await reset(wrapper)
    expect(model.value.name).toBe(false)
  })

  it('does not touch a field that is already empty', async () => {
    const { model, wrapper } = mountForm()
    model.value.name = []
    const before = model.value.name
    await reset(wrapper)
    expect(model.value.name).toBe(before)
  })

  it('does not touch an existing value on mount', async () => {
    const model = ref<Record<string, unknown>>({
      name: 'a',
      tags: ['x'],
      flag: true,
    })
    mount(defineComponent({
      render: () => h(ZnForm, {
        modelValue: model.value,
        'onUpdate:modelValue': (value: Record<string, unknown>) => {
          model.value = value
        },
      }, () => [
        h(ZnFormItem, { path: 'name' }),
        h(ZnFormItem, { path: 'tags' }),
        h(ZnFormItem, { path: 'flag' }),
      ]),
    }))
    await nextTick()
    expect(model.value).toEqual({
      name: 'a',
      tags: ['x'],
      flag: true,
    })
  })

  it('leaves an absent field absent when there is no default value', async () => {
    const { model, wrapper } = mountForm()
    delete model.value.name
    await reset(wrapper)
    expect(Object.hasOwn(model.value, 'name')).toBe(false)
  })

  describe('span', () => {
    it.each([
      ['超过列数', 5, 2],
      ['为小数', 2.5, 2],
      ['为 0', 0, 1],
      ['为负数', -1, 1],
    ])('%s 时输出 1..cols 之间的整数', async (_, span, expected) => {
      const wrapper = mount(defineComponent({
        render: () => h(ZnForm, {
          modelValue: { name: '' },
          cols: 2,
        }, () => h(ZnFormItem, {
          path: 'name',
          span,
        })),
      }))
      await nextTick()

      expect(wrapper.find('.n-form-item').attributes('style')).toContain(`grid-column: span ${expected}`)
      wrapper.unmount()
    })

    it('span 小数为 2.5、列数为 4 时向下取整', async () => {
      const wrapper = mount(defineComponent({
        render: () => h(ZnForm, {
          modelValue: { name: '' },
          cols: 4,
        }, () => h(ZnFormItem, {
          path: 'name',
          span: 2.5,
        })),
      }))
      await nextTick()

      expect(wrapper.find('.n-form-item').attributes('style')).toContain('grid-column: span 2')
      wrapper.unmount()
    })

    it('不传 span 时不设置 grid-column', async () => {
      const { wrapper } = mountForm()
      await nextTick()

      expect(wrapper.find('.n-form-item').attributes('style') ?? '').not.toContain('grid-column')
      wrapper.unmount()
    })
  })
})

describe('<ZnFormItem> defaultValue', () => {
  it('gives each row its own copy of an object default value', async () => {
    const shared = { start: '2024-01-01', end: '2024-01-02' }
    const rows = [{}, {}] as Record<string, unknown>[]
    const wrapper = mount(defineComponent({
      render: () => h('div', rows.map((row, index) => h(ZnForm, {
        key: index,
        modelValue: row,
        'onUpdate:modelValue': (value: Record<string, unknown>) => Object.assign(rows[index]!, value),
      }, () => h(ZnFormItem, {
        path: { start: 'from', end: 'to' },
        defaultValue: shared,
      })))),
    }))
    await nextTick()

    expect(rows[0]).toMatchObject({ from: '2024-01-01', to: '2024-01-02' })
    expect(rows[0]).not.toBe(shared)
    wrapper.unmount()
  })

  it('does not write into the default value when the model is edited', async () => {
    const shared = ['a']
    const model = ref<Record<string, unknown>>({})
    const wrapper = mount(defineComponent({
      render: () => h(ZnForm, {
        modelValue: model.value,
        'onUpdate:modelValue': (value: Record<string, unknown>) => {
          model.value = value
        },
      }, () => h(ZnFormItem, { path: 'tags', defaultValue: shared })),
    }))
    await nextTick()

    ;(model.value.tags as string[]).push('b')
    expect(shared).toEqual(['a'])
    wrapper.unmount()
  })
})

/** 模拟声明了空值的字段组件 */
const Stub = defineComponent({
  props: {
    emptyValues: { type: Array as PropType<unknown[]>, required: true },
  },
  setup(props) {
    useZnFormItemEmptyValues(props.emptyValues)
    return () => h('i')
  },
})

describe('<ZnFormItem> empty values', () => {
  function mountWithEmpty(model: Record<string, unknown>, emptyValues: unknown[]) {
    const data = ref(model)
    const wrapper = mount(defineComponent({
      render: () => h(ZnForm, {
        modelValue: data.value,
        'onUpdate:modelValue': (value: Record<string, unknown>) => {
          data.value = value
        },
      }, () => h(ZnFormItem, { path: 'agree', label: '是否同意', required: true }, () => h(Stub, { emptyValues }))),
    }))
    return { data, wrapper }
  }

  it('treats false as filled by default', async () => {
    const { wrapper } = mountWithEmpty({ agree: false }, [])
    await nextTick()
    await expect(wrapper.findComponent(ZnForm).vm.submit()).resolves.toBe(true)
    wrapper.unmount()
  })

  it('treats false as empty when the field declares it', async () => {
    const { wrapper } = mountWithEmpty({ agree: false }, [undefined, null, '', false])
    await nextTick()
    await expect(wrapper.findComponent(ZnForm).vm.submit()).resolves.toBe(false)
    await nextTick()
    expect(wrapper.text()).toContain('是否同意不能为空')
    wrapper.unmount()
  })

  it('still treats an empty array as empty', async () => {
    const { wrapper } = mountWithEmpty({ agree: [] }, [])
    await nextTick()
    await expect(wrapper.findComponent(ZnForm).vm.submit()).resolves.toBe(false)
    wrapper.unmount()
  })
})
