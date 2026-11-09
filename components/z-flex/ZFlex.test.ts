import type { MockInstance } from 'vitest'
import { mount } from '@vue/test-utils'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import ZFlex from './ZFlex.vue'

let warn: MockInstance<typeof console.warn>

beforeEach(() => {
  warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
})

afterEach(() => {
  warn.mockRestore()
})

// 使用方可能从外部配置里拿到任意字符串，测试里绕过类型检查，模拟这种输入。
function mountPlace(place: string) {
  return mount(ZFlex, {
    props: { place: place as never },
  })
}

function styleOf(place: string) {
  return mountPlace(place).attributes('style') ?? ''
}

function gapStyle(gap: number | string) {
  return mount(ZFlex, {
    props: { gap },
  }).attributes('style')
}

describe('<ZFlex>', () => {
  it('renders the default slot', () => {
    const wrapper = mount(ZFlex, {
      slots: { default: 'content' },
    })
    expect(wrapper.text()).toBe('content')
    expect(wrapper.classes()).not.toContain('z-flex--column')
  })

  it('lays out in a column when column is set', () => {
    const wrapper = mount(ZFlex, {
      props: { column: true },
    })
    expect(wrapper.classes()).toContain('z-flex--column')
  })

  it('converts a numeric gap to rem and keeps a string gap as is', () => {
    expect(gapStyle(0.5)).toContain('gap: 0.5rem')
    expect(gapStyle('10px')).toContain('gap: 10px')
  })

  it('sets both axes for a two-value place', () => {
    expect(styleOf('between center')).toContain('justify-content: space-between')
    expect(styleOf('between center')).toContain('align-items: center')
  })

  it('accepts any amount of whitespace between the two values', () => {
    expect(styleOf('between  center')).toContain('justify-content: space-between')
    expect(styleOf('  between\tcenter  ')).toContain('align-items: center')
    expect(warn).not.toHaveBeenCalled()
  })

  it('applies a value shared by both axes to both axes', () => {
    expect(styleOf('center')).toContain('justify-content: center')
    expect(styleOf('center')).toContain('align-items: center')
  })

  it('applies a main-axis-only value to justify-content', () => {
    expect(styleOf('between')).toContain('justify-content: space-between')
    expect(styleOf('between')).not.toContain('align-items')
  })

  it('applies a cross-axis-only value to align-items', () => {
    expect(styleOf('baseline')).toContain('align-items: baseline')
    expect(styleOf('baseline')).not.toContain('justify-content')
  })

  it('warns and sets no alignment for an unknown value', () => {
    const style = styleOf('middle')
    expect(style).not.toContain('justify-content')
    expect(style).not.toContain('align-items')
    expect(warn).toHaveBeenCalledOnce()
    expect(warn.mock.calls[0]![0]).toContain('ZFlex')
  })

  it.each([
    'between middle',
    'center center center',
    'between center start',
  ])('warns for the malformed place %o', (place) => {
    const style = styleOf(place)
    expect(style).not.toContain('justify-content')
    expect(style).not.toContain('align-items')
    expect(warn).toHaveBeenCalledOnce()
  })

  it('treats a non-string place as invalid instead of throwing', () => {
    const style = mountPlace(42 as unknown as string).attributes('style') ?? ''
    expect(style).not.toContain('justify-content')
    expect(warn).toHaveBeenCalledOnce()
  })

  it('warns once per distinct value', async () => {
    const wrapper = mountPlace('bogus')
    await wrapper.setProps({ gap: 1 })
    await wrapper.setProps({ place: 'nonsense' as never })
    await wrapper.setProps({ place: 'bogus' as never })
    expect(warn).toHaveBeenCalledTimes(2)
  })

  it('drops the alignment when place becomes undefined', async () => {
    const wrapper = mount(ZFlex, {
      props: { place: 'between' },
    })
    await wrapper.setProps({ place: undefined })
    expect(wrapper.attributes('style') ?? '').not.toContain('justify-content')
  })
})
