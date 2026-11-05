import type { ComponentResolver } from 'unplugin-vue-components/types'

const components = new Set([
  'ZButton',
  'ZIcon',
  'ZnButton',
])

export interface ZResolverOptions {
  /** @default true */
  importStyle?: boolean
}

export function ZResolver(options: ZResolverOptions = {}): ComponentResolver {
  const { importStyle = true } = options

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
        sideEffects: importStyle ? '@zhzwz/z/style.css' : undefined,
      }
    },
  }
}
