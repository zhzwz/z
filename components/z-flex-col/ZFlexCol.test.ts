import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import ZFlexCol from './ZFlexCol.vue'

describe('<ZFlexCol>', () => {
  it('renders as a column and forwards gap and place', () => {
    const wrapper = mount(ZFlexCol, {
      props: { gap: 1, place: 'between' },
      slots: { default: 'content' },
    })
    const style = wrapper.attributes('style') ?? ''
    expect(wrapper.text()).toBe('content')
    expect(wrapper.classes()).toContain('z-flex--column')
    expect(style).toContain('gap: 1rem')
    expect(style).toContain('justify-content: space-between')
  })
})
