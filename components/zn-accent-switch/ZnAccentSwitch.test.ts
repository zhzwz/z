import { mount } from '@vue/test-utils'
import { afterEach, describe, expect, it } from 'vitest'
import { nextTick } from 'vue'
import ZnAccentSwitch from './ZnAccentSwitch.vue'

function mountSwitch() {
  return mount(ZnAccentSwitch, { attachTo: document.body })
}

function panel() {
  return document.querySelector('.n-popover')
}

function option(label: string) {
  return document.querySelector<HTMLButtonElement>(`.n-popover [aria-label="${label}"]`)
}

describe('<ZnAccentSwitch>', () => {
  afterEach(() => {
    document.documentElement.removeAttribute('data-z-accent')
    document.body.innerHTML = ''
  })

  it('keeps the panel closed', async () => {
    const wrapper = mountSwitch()
    await nextTick()
    const trigger = wrapper.get('button')
    expect(trigger.attributes('aria-expanded')).toBe('false')
    expect(trigger.attributes('aria-label')).toBe('强调色')
    expect(trigger.find('svg').exists()).toBe(true)
    expect(panel()).toBeNull()
    wrapper.unmount()
  })

  it('opens a panel and writes data-z-accent', async () => {
    const wrapper = mountSwitch()
    await nextTick()
    await wrapper.get('button').trigger('click')
    await nextTick()
    const cyan = option('cyan')
    expect(cyan).not.toBeNull()
    cyan!.click()
    await nextTick()
    expect(document.documentElement.dataset.zAccent).toBe('cyan')
    expect(panel()).toBeNull()
    expect(wrapper.get('button').attributes('aria-label')).toBe('强调色')
    wrapper.unmount()
  })

  it('follows an attribute change from outside', async () => {
    const wrapper = mountSwitch()
    await nextTick()
    await wrapper.get('button').trigger('click')
    await nextTick()
    document.documentElement.dataset.zAccent = 'orange'
    await nextTick()
    await nextTick()
    expect(option('orange')?.getAttribute('aria-pressed')).toBe('true')
    expect(option('blue')?.getAttribute('aria-pressed')).toBe('false')
    wrapper.unmount()
  })

  it('closes on Escape and on a press outside', async () => {
    const wrapper = mountSwitch()
    await nextTick()
    await wrapper.get('button').trigger('click')
    await nextTick()
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))
    await nextTick()
    expect(panel()).toBeNull()

    await wrapper.get('button').trigger('click')
    await nextTick()
    document.body.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }))
    document.body.dispatchEvent(new MouseEvent('mouseup', { bubbles: true }))
    await nextTick()
    expect(panel()).toBeNull()
    wrapper.unmount()
  })
})
