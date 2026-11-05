import type { ComponentMountingOptions } from '@vue/test-utils'
import type { MockInstance } from 'vitest'
import { mount } from '@vue/test-utils'
import { NButton } from 'naive-ui'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { defineComponent, h, nextTick, ref } from 'vue'
import ZnButton from './ZnButton.vue'

type MountingOptions = ComponentMountingOptions<typeof ZnButton>

const IconAdd = defineComponent(() => () => h('svg', { class: 'icon-add' }))
const named = { 'aria-label': '新建' }

let warn: MockInstance<typeof console.warn>

beforeEach(() => {
  warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
})

afterEach(() => {
  expect(warn).not.toHaveBeenCalled()
  warn.mockRestore()
})

describe('<ZnButton>', () => {
  it('renders the default slot', () => {
    const wrapper = mount(ZnButton, {
      slots: { default: 'Save' },
    })
    expect(wrapper.text()).toBe('Save')
  })

  it('renders the label prop', () => {
    const wrapper = mount(ZnButton, {
      props: { label: '新建' },
    })
    expect(wrapper.text()).toBe('新建')
    expect(wrapper.attributes('label')).toBeUndefined()
  })

  it('prefers the default slot over the label prop', () => {
    const wrapper = mount(ZnButton, {
      props: { label: '新建' },
      slots: { default: 'Save' },
    })
    expect(wrapper.text()).toBe('Save')
  })

  it('renders the icon prop with ZIcon', () => {
    const wrapper = mount(ZnButton, {
      props: { icon: IconAdd, label: '新建' },
    })
    expect(wrapper.find('svg.icon-add.z-icon').exists()).toBe(true)
  })

  it('forwards the icon slot', () => {
    const wrapper = mount(ZnButton, {
      attrs: named,
      slots: { icon: '<i class="icon" />' },
    })
    expect(wrapper.find('.icon').exists()).toBe(true)
  })

  it('prefers the icon slot over the icon prop', () => {
    const wrapper = mount(ZnButton, {
      props: { icon: IconAdd },
      attrs: named,
      slots: { icon: '<i class="icon" />' },
    })
    expect(wrapper.find('.icon').exists()).toBe(true)
    expect(wrapper.find('.icon-add').exists()).toBe(false)
  })

  it('follows slots added or removed by the parent', async () => {
    const showIcon = ref(false)
    function renderSlots() {
      if (!showIcon.value) {
        return {}
      }
      return {
        icon: () => h('i', { class: 'icon' }),
      }
    }
    const wrapper = mount(() => h(ZnButton, named, renderSlots()))
    expect(wrapper.find('.icon').exists()).toBe(false)

    showIcon.value = true
    await nextTick()
    expect(wrapper.find('.icon').exists()).toBe(true)
  })

  it.each<[string, MountingOptions]>([
    [
      'an icon prop',
      {
        props: { icon: IconAdd },
        attrs: named,
      },
    ],
    [
      'an icon slot',
      {
        slots: { icon: '<i />' },
        attrs: named,
      },
    ],
    [
      'renderIcon',
      {
        props: {
          renderIcon: () => h('i'),
        },
        attrs: named,
      },
    ],
  ])('becomes square with only %s', (_, options) => {
    const wrapper = mount(ZnButton, options)
    expect(wrapper.classes()).toContain('zn-button--icon-only')
  })

  it.each<[string, MountingOptions]>([
    [
      'a label',
      {
        props: { icon: IconAdd, label: '新建' },
      },
    ],
    [
      'a default slot',
      {
        props: { icon: IconAdd },
        slots: { default: '新建' },
      },
    ],
    [
      'the text style',
      {
        props: { icon: IconAdd, text: true },
        attrs: named,
      },
    ],
    ['no icon', {}],
  ])('keeps its width with %s', (_, options) => {
    const wrapper = mount(ZnButton, options)
    expect(wrapper.classes()).not.toContain('zn-button--icon-only')
  })

  it('forwards NButton props', () => {
    const wrapper = mount(ZnButton, {
      props: { type: 'primary', attrType: 'submit', block: true },
    })
    expect(wrapper.findComponent(NButton).props()).toMatchObject({
      type: 'primary',
      attrType: 'submit',
      block: true,
    })
    expect(wrapper.attributes('type')).toBe('submit')
  })

  it('keeps NButton defaults', () => {
    const wrapper = mount(ZnButton)
    expect(wrapper.findComponent(NButton).props()).toMatchObject({
      type: 'default',
      attrType: 'button',
      bordered: true,
      size: undefined,
    })
  })

  it('calls the click listener', async () => {
    const onClick = vi.fn()
    const wrapper = mount(ZnButton, {
      props: { onClick },
    })
    await wrapper.trigger('click')
    expect(onClick).toHaveBeenCalledWith(expect.any(MouseEvent))
  })

  it('does not call the click listener when disabled', async () => {
    const onClick = vi.fn()
    const wrapper = mount(ZnButton, {
      props: { disabled: true, onClick },
    })
    wrapper.element.dispatchEvent(new MouseEvent('click'))
    expect(onClick).not.toHaveBeenCalled()
  })

  it('passes class and attributes through to the button element', () => {
    const wrapper = mount(ZnButton, {
      attrs: { class: 'extra', 'data-test': 'x' },
    })
    expect(wrapper.classes()).toContain('extra')
    expect(wrapper.attributes('data-test')).toBe('x')
  })

  describe('accessibility', () => {
    it('names an icon-only button with aria-label', () => {
      const wrapper = mount(ZnButton, {
        props: { icon: IconAdd },
        attrs: { 'aria-label': '新建' },
      })
      expect(wrapper.element.tagName).toBe('BUTTON')
      expect(wrapper.attributes('aria-label')).toBe('新建')
    })

    it('hides the icon from screen readers', () => {
      const wrapper = mount(ZnButton, {
        props: { icon: IconAdd, label: '新建' },
      })
      expect(wrapper.find('.icon-add').attributes('aria-hidden')).toBe('true')
    })

    it.each<[string, MountingOptions]>([
      [
        'an icon prop',
        {
          props: { icon: IconAdd },
        },
      ],
      [
        'an icon slot',
        {
          slots: { icon: '<i />' },
        },
      ],
      [
        'the text style',
        {
          props: { icon: IconAdd, text: true },
        },
      ],
    ])('warns once when an icon-only button with %s has no accessible name', async (_, options) => {
      const wrapper = mount(ZnButton, options)
      await wrapper.setProps({ loading: true })
      expect(warn).toHaveBeenCalledOnce()
      expect(String(warn.mock.calls[0]![0])).toContain('aria-label')
      warn.mockClear()
    })

    it.each(['aria-label', 'aria-labelledby', 'title'])('does not warn when named by %s', (name) => {
      mount(ZnButton, {
        props: { icon: IconAdd },
        attrs: { [name]: '新建' },
      })
    })
  })
})
