import { mount } from '@vue/test-utils'
import { afterEach, describe, expect, it } from 'vitest'
import { nextTick } from 'vue'
import ZnAccentPanel from './ZnAccentPanel.vue'

function swatch(wrapper: ReturnType<typeof mount>, name: string) {
  return wrapper.get(`[aria-label="${name}"]`)
}

describe('<ZnAccentPanel>', () => {
  afterEach(() => {
    document.documentElement.removeAttribute('data-z-accent')
  })

  it('marks the default accent', async () => {
    const wrapper = mount(ZnAccentPanel)
    await nextTick()
    expect(swatch(wrapper, 'blue').attributes('aria-pressed')).toBe('true')
    expect(swatch(wrapper, 'cyan').text()).toBe('')
    wrapper.unmount()
  })

  it('writes data-z-accent and emits pick', async () => {
    const wrapper = mount(ZnAccentPanel)
    await nextTick()
    await swatch(wrapper, 'cyan').trigger('click')
    expect(document.documentElement.dataset.zAccent).toBe('cyan')
    expect(swatch(wrapper, 'cyan').attributes('aria-pressed')).toBe('true')
    expect(wrapper.emitted('pick')).toEqual([
      ['cyan'],
    ])
    wrapper.unmount()
  })

  it('follows an attribute change from outside', async () => {
    const wrapper = mount(ZnAccentPanel)
    await nextTick()
    document.documentElement.dataset.zAccent = 'orange'
    await nextTick()
    await nextTick()
    expect(swatch(wrapper, 'orange').attributes('aria-pressed')).toBe('true')
    expect(swatch(wrapper, 'blue').attributes('aria-pressed')).toBe('false')
    wrapper.unmount()
  })
})
