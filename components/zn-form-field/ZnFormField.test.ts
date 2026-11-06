import type { MockInstance } from 'vitest'
import { mount } from '@vue/test-utils'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { h, nextTick, ref } from 'vue'
import { ZnForm } from '../zn-form'
import ZnFormField from './ZnFormField.vue'

let error: MockInstance<typeof console.error>

beforeEach(() => {
  error = vi.spyOn(console, 'error').mockImplementation(() => {})
})

afterEach(() => {
  expect(error).not.toHaveBeenCalled()
  error.mockRestore()
})

function mountField(field: { component: string, path: unknown }) {
  return mount(ZnFormField, {
    props: { field: field as never },
  })
}

describe('<ZnFormField>', () => {
  it('renders nothing and logs an error for an unknown component', async () => {
    const wrapper = mountField({ component: 'ZnNope', path: 'a.b' })
    await nextTick()

    expect(wrapper.find('.n-form-item').exists()).toBe(false)
    expect(error).toHaveBeenCalledOnce()
    expect(String(error.mock.calls[0]![0])).toContain('未知组件 ZnNope')
    expect(String(error.mock.calls[0]![0])).toContain('a.b')
    error.mockClear()
  })

  it('does not log again when the same field re-renders', async () => {
    const field = ref({ component: 'ZnNope', path: 'a' })
    mount(() => h(ZnFormField, { field: field.value }))
    await nextTick()
    field.value = { component: 'ZnNope', path: 'a.b' }
    await nextTick()

    expect(error).toHaveBeenCalledOnce()
    error.mockClear()
  })

  it('logs every distinct unknown component separately', async () => {
    mount(ZnForm, {
      props: {
        modelValue: {},
        schema: {
          fields: [
            { component: 'ZnNope', path: 'a' },
            { component: 'ZnOther', path: 'b' },
          ],
        },
      },
    })
    await nextTick()

    expect(error).toHaveBeenCalledTimes(2)
    error.mockClear()
  })

  it('stays silent for a known component', async () => {
    mountField({ component: 'ZnInput', path: 'name' })
    await nextTick()
  })

  it('keeps rendering other fields when one component is unknown', async () => {
    const wrapper = mount(ZnForm, {
      props: {
        modelValue: { name: 'x' },
        schema: {
          fields: [
            { component: 'ZnNope', path: 'a' },
            { component: 'ZnInput', path: 'name' },
          ],
        },
      },
    })
    await nextTick()

    expect((wrapper.find('input').element as HTMLInputElement).value).toBe('x')
    expect(error).toHaveBeenCalledOnce()
    error.mockClear()
  })

  it('logs an unknown component whose path cannot be serialized', async () => {
    const path: Record<string, unknown> = {}
    path.self = path
    mountField({ component: 'ZnNope', path })
    await nextTick()

    expect(error).toHaveBeenCalledOnce()
    expect(String(error.mock.calls[0]![0])).toContain('ZnNope')
    error.mockClear()
  })
})
