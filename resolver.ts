import type { ComponentResolver } from 'unplugin-vue-components/types'

const components = new Set([
  'ZFlex',
  'ZIcon',
  'ZnButton',
  'ZnCheckbox',
  'ZnCheckboxGroup',
  'ZnConfigProvider',
  'ZnDate',
  'ZnDateRange',
  'ZnDateTime',
  'ZnForm',
  'ZnFormField',
  'ZnFormItem',
  'ZnInput',
  'ZnInputNumber',
  'ZnRadioGroup',
  'ZnScrollbar',
  'ZnSelect',
  'ZnSelectMulti',
  'ZnSwitch',
  'ZnTextarea',
])

export function ZResolver(): ComponentResolver {
  return {
    type: 'component',
    resolve(name) {
      if (!components.has(name)) {
        return
      }
      const dir = name.replace(/\B([A-Z])/g, '-$1').toLowerCase()
      return {
        name,
        from: `@zhzwz/z/components/${dir}`,
      }
    },
  }
}
