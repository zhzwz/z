import type { SelectGroupOption, SelectOption, SelectRenderLabel } from 'naive-ui'
import type { PropType } from 'vue'
import type { ZIconProps } from '../z-icon'
import { h } from 'vue'
import { ZIcon } from '../z-icon'

export type ZnSelectOption = SelectOption & {
  /** 选项图标，用法同 ZIcon；传了 `renderLabel` 时由它负责渲染 */
  icon?: ZIconProps['icon']
}

export type ZnSelectGroupOption = SelectGroupOption & {
  children?: ZnSelectOption[]
}

export const optionsProp = {
  type: Array as PropType<(ZnSelectOption | ZnSelectGroupOption)[]>,
  default: () => [],
} as const

export function iconLabelRenderer(labelField: () => string): SelectRenderLabel {
  return (option, selected) => {
    const label = option[labelField()]
    const content = typeof label === 'function'
      ? label(option, selected)
      : label
    if (!option.icon) {
      return content
    }
    return h('span', {
      style: { display: 'inline-flex', alignItems: 'center', gap: '0.25em' },
    }, [
      h(ZIcon, { icon: option.icon as ZIconProps['icon'] }),
      content,
    ])
  }
}
