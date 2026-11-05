import type { MockInstance } from 'vitest'
import { addIcon } from '@iconify/vue'
import { mount } from '@vue/test-utils'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { defineComponent, h, nextTick, reactive } from 'vue'
import ZIcon from './ZIcon.vue'

const square = { body: '<path d="M0 0h24v24H0z"/>', width: 24, height: 24 }
const IconAdd = defineComponent(() => () => h('svg', { class: 'icon-add' }))

let warn: MockInstance<typeof console.warn>

beforeEach(() => {
  warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
})

afterEach(() => {
  expect(warn).not.toHaveBeenCalled()
  warn.mockRestore()
})

describe('<ZIcon>', () => {
  it('renders a registered iconify icon by name', async () => {
    addIcon('test:square', square)
    const wrapper = mount(ZIcon, {
      props: { icon: 'test:square' },
    })
    await nextTick()
    expect(wrapper.find('svg path').attributes('d')).toBe('M0 0h24v24H0z')
  })

  it('renders iconify icon data without loading it', async () => {
    const wrapper = mount(ZIcon, {
      props: { icon: square },
    })
    await nextTick()
    expect(wrapper.find('svg path').exists()).toBe(true)
  })

  it('renders an icon component', () => {
    const wrapper = mount(ZIcon, {
      props: { icon: IconAdd },
    })
    expect(wrapper.find('svg.icon-add').exists()).toBe(true)
  })

  it('renders an icon component taken from reactive state', () => {
    const options = reactive({ icon: IconAdd })
    const wrapper = mount(() => h(ZIcon, { icon: options.icon }))
    expect(wrapper.find('svg.icon-add').exists()).toBe(true)
  })

  it.each([undefined, null, ''])('renders nothing when the icon is %o', (icon) => {
    const wrapper = mount(ZIcon, {
      props: { icon },
      attrs: { class: 'extra' },
    })
    expect(wrapper.html()).toBe('<!--v-if-->')
  })

  it('passes attributes to the icon', async () => {
    const wrapper = mount(ZIcon, {
      props: { icon: square },
      attrs: { class: 'extra', 'data-test': 'x' },
    })
    await nextTick()
    expect(wrapper.classes()).toEqual(expect.arrayContaining(['z-icon', 'extra']))
    expect(wrapper.attributes('data-test')).toBe('x')
  })

  describe.each([
    ['iconify data', square],
    ['component', IconAdd],
  ])('accessibility with %s', (_, icon) => {
    it('is hidden from screen readers by default', async () => {
      const wrapper = mount(ZIcon, {
        props: { icon },
      })
      await nextTick()
      expect(wrapper.attributes('aria-hidden')).toBe('true')
    })

    it('is announced as an image when labelled', async () => {
      const wrapper = mount(ZIcon, {
        props: { icon },
        attrs: { 'aria-label': '收藏' },
      })
      await nextTick()
      expect(wrapper.attributes('aria-hidden')).toBeUndefined()
      expect(wrapper.attributes('role')).toBe('img')
      expect(wrapper.attributes('aria-label')).toBe('收藏')
    })
  })
})
