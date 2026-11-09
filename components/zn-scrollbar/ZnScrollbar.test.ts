import { mount } from '@vue/test-utils'
import { NScrollbar } from 'naive-ui'
import { describe, expect, it } from 'vitest'
import ZnScrollbar from './ZnScrollbar.vue'

describe('<ZnScrollbar>', () => {
  it('lets size override width and height without changing the object passed in', () => {
    const themeOverrides = { color: 'red', width: '2px', height: '4px' }
    const wrapper = mount(ZnScrollbar, {
      props: { size: 8, themeOverrides },
    })
    expect(themeOverrides).toEqual({ color: 'red', width: '2px', height: '4px' })
    expect(wrapper.findComponent(NScrollbar).props('themeOverrides')).toEqual({
      color: 'red',
      width: '8px',
      height: '8px',
    })
  })

  it('leaves the scrollbar width alone when size is omitted', () => {
    const wrapper = mount(ZnScrollbar)
    expect(wrapper.findComponent(NScrollbar).props('themeOverrides')).toBeUndefined()
  })
})
