import type { Component } from 'vue'
import { mount } from '@vue/test-utils'
import { NInput } from 'naive-ui'
import { describe, expect, it } from 'vitest'
import { createSSRApp, defineComponent, h, ref } from 'vue'
import { renderToString } from 'vue/server-renderer'
import { ZnButton } from '../zn-button'
import { ZnCheckbox } from '../zn-checkbox'
import { ZnCheckboxGroup } from '../zn-checkbox-group'
import { ZnDate } from '../zn-date'
import { ZnDateRange } from '../zn-date-range'
import { ZnDateTime } from '../zn-date-time'
import { ZnForm } from '../zn-form'
import { ZnFormItem } from '../zn-form-item'
import { ZnInput } from '../zn-input'
import { ZnInputNumber } from '../zn-input-number'
import { ZnRadioGroup } from '../zn-radio-group'
import { ZnScrollbar } from '../zn-scrollbar'
import { ZnSelect } from '../zn-select'
import { ZnSelectMulti } from '../zn-select-multi'
import { ZnSwitch } from '../zn-switch'
import { ZnTextarea } from '../zn-textarea'
import ZnConfigProvider from './ZnConfigProvider.vue'

const components: Record<string, Component> = {
  ZnButton,
  ZnCheckbox,
  ZnCheckboxGroup,
  ZnDate,
  ZnDateRange,
  ZnDateTime,
  ZnForm,
  ZnFormItem,
  ZnInput,
  ZnInputNumber,
  ZnRadioGroup,
  ZnScrollbar,
  ZnSelect,
  ZnSelectMulti,
  ZnSwitch,
  ZnTextarea,
}

/** 各组件的一个合法模型值，模拟使用方的 v-model */
const models: Record<string, Record<string, unknown>> = {
  ZnCheckbox: { modelValue: true },
  ZnCheckboxGroup: {
    modelValue: ['a'],
  },
  ZnDate: { modelValue: '2024-01-01' },
  ZnDateRange: { start: '2024-01-01', end: '2024-01-02' },
  ZnDateTime: { modelValue: '2024-01-01 00:00:00' },
  ZnForm: {
    modelValue: { secret: 'p@ssw0rd' },
  },
  ZnInput: { modelValue: 'p@ssw0rd' },
  ZnInputNumber: { modelValue: 42 },
  ZnRadioGroup: { modelValue: 'a' },
  ZnSelect: { modelValue: 'a' },
  ZnSelectMulti: {
    modelValue: ['a'],
  },
  ZnSwitch: { modelValue: true },
  ZnTextarea: { modelValue: 'p@ssw0rd' },
}

const cases = Object.entries(components)
  .map(([name, component]) => [name, component, models[name] ?? {}] as const)

/** `defineModel` 生成的 prop，透传给 naive 时会作为 fallthrough attr 输出成属性（DOM 里是小写） */
const modelKeys = [
  'modelValue',
  'modelModifiers',
  'start',
  'end',
]

function renderedModelAttributes(element: Element) {
  const keys = modelKeys.map(key => key.toLowerCase())
  return [...element.attributes]
    .map(attribute => attribute.name.toLowerCase())
    .filter(name => keys.some(key => name.startsWith(key)))
}

describe('useZnDefaults', () => {
  it.each(cases)('does not render the model of %s as an attribute', (_, component, props) => {
    const wrapper = mount(component, { props })
    expect(renderedModelAttributes(wrapper.element)).toEqual([])
  })

  it.each(cases)('does not render the model of %s inside ZnConfigProvider', (_, component, props) => {
    const wrapper = mount({
      render: () => h(ZnConfigProvider, null, () => h(component, props)),
    })
    expect(renderedModelAttributes(wrapper.element)).toEqual([])
  })

  it('does not render the modifiers of v-model.trim', () => {
    const value = ref<string | null>(' a ')
    const wrapper = mount(defineComponent({
      render: () => h(ZnInput, {
        modelValue: value.value,
        modelModifiers: { trim: true },
        'onUpdate:modelValue': (next: string | null) => value.value = next,
      }),
    }))
    expect(renderedModelAttributes(wrapper.element)).toEqual([])
  })

  it('keeps the model out of the SSR output', async () => {
    const html = await renderToString(createSSRApp({
      render: () => h(ZnConfigProvider, null, () => h(ZnInput, { modelValue: 'p@ssw0rd' })),
    }))
    expect(html).not.toMatch(/modelvalue/i)
  })

  it('applies the builtin defaults', () => {
    const wrapper = mount({
      render: () => h(ZnConfigProvider, null, () => h(ZnInput)),
    })
    expect(wrapper.findComponent(NInput).props('clearable')).toBe(true)
  })

  it('prefers props passed by the parent over the defaults', () => {
    const wrapper = mount({
      render: () => h(ZnConfigProvider, null, () => h(ZnInput, { clearable: false })),
    })
    expect(wrapper.findComponent(NInput).props('clearable')).toBe(false)
  })

  it.each<[string, Record<string, unknown>]>([
    [
      'showCount',
      { showCount: null },
    ],
    [
      'show-count',
      { 'show-count': null },
    ],
  ])('keeps an explicitly passed null (%s) instead of the default', (_, inputProps) => {
    const defaults = {
      ZnInput: { showCount: true },
    }
    const wrapper = mount({
      render: () =>
        h(ZnConfigProvider, { defaults }, () => h(ZnInput, inputProps)),
    })
    expect(wrapper.findComponent(NInput).props('showCount')).toBeNull()
  })

  it('uses the default again when the passed prop is undefined', () => {
    const defaults = {
      ZnInput: { showCount: true },
    }
    const wrapper = mount({
      render: () =>
        h(ZnConfigProvider, { defaults }, () => h(ZnInput, { showCount: undefined })),
    })
    expect(wrapper.findComponent(NInput).props('showCount')).toBe(true)
  })

  it('still forwards the model and the other props to naive', async () => {
    const wrapper = mount(ZnInput, {
      props: { modelValue: 'a', placeholder: '姓名' },
    })
    expect(wrapper.findComponent(NInput).props()).toMatchObject({ value: 'a', placeholder: '姓名' })

    await wrapper.setProps({ modelValue: 'ab' })
    expect(wrapper.findComponent(NInput).props('value')).toBe('ab')
  })
})

describe('znConfigProvider', () => {
  it('ignores defaults for keys the component does not declare', () => {
    const wrapper = mount({
      render: () => h(ZnConfigProvider, {
        // 这些键是组件裁掉的（ZnInput 不提供 type="textarea"、pair），不能从外部配置漏进 naive
        defaults: {
          ZnInput: {
            modelValue: 'secret',
            type: 'textarea',
            pair: true,
            'data-x': 'y',
          },
        },
      } as never, () => h(ZnInput, { modelValue: 'a' })),
    })
    const input = wrapper.findComponent(NInput)
    expect(input.props('type')).toBe('text')
    expect(input.props('pair')).toBe(false)
    expect(wrapper.find('textarea').exists()).toBe(false)
    expect(wrapper.find('.n-input').attributes('data-x')).toBeUndefined()
    expect(wrapper.find('.n-input').attributes('modelvalue')).toBeUndefined() // cspell:disable-line
  })

  it('keeps the model out of the SSR output when it comes from defaults', async () => {
    const html = await renderToString(createSSRApp({
      render: () => h(ZnConfigProvider, {
        defaults: {
          ZnInput: { modelValue: 'p@ssw0rd' },
        },
      } as never, () => h(ZnInput)),
    }))
    expect(html).not.toContain('p@ssw0rd')
  })

  it('passes class and attributes through to a host element', () => {
    const wrapper = mount({
      render: () => h(ZnConfigProvider, { class: 'my-app', 'data-theme': 'dark' }, () => h('span', 'x')),
    })
    expect(wrapper.find('.zn-config-provider').classes()).toContain('my-app')
    expect(wrapper.find('.zn-config-provider').attributes('data-theme')).toBe('dark')
  })

  it('passes class and attributes through on a nested provider', () => {
    const wrapper = mount({
      render: () => h(ZnConfigProvider, null, () => h(ZnConfigProvider, { class: 'inner' }, () => h('span', 'x'))),
    })
    expect(wrapper.find('.zn-config-provider.inner').exists()).toBe(true)
  })
})
