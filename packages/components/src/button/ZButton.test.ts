import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import ZButton from './ZButton.vue'

describe('<ZButton>', () => {
  it('renders the default slot', () => {
    const wrapper = mount(ZButton, {
      slots: { default: 'Save' },
    })
    expect(wrapper.text()).toBe('Save')
  })

  it('defaults to type="button" so it never submits a form by accident', () => {
    const wrapper = mount(ZButton)
    expect(wrapper.attributes('type')).toBe('button')
  })

  it('forwards the type prop', () => {
    const wrapper = mount(ZButton, {
      props: { type: 'submit' },
    })
    expect(wrapper.attributes('type')).toBe('submit')
  })

  it('emits click with the native event', async () => {
    const wrapper = mount(ZButton)
    await wrapper.trigger('click')
    const [[event]] = wrapper.emitted('click')!
    expect(event).toBeInstanceOf(MouseEvent)
  })

  it('does not emit click when disabled', async () => {
    const wrapper = mount(ZButton, {
      props: { disabled: true },
    })
    expect(wrapper.attributes('disabled')).toBeDefined()
    // wrapper.trigger 会直接跳过 disabled 元素，测不到组件本身。
    wrapper.element.dispatchEvent(new MouseEvent('click'))
    expect(wrapper.emitted('click')).toBeUndefined()
  })
})
