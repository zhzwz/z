import type { GlobalTheme } from 'naive-ui'
import { darkTheme } from 'naive-ui'
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { currentChoice } from './theme.ts'

/**
 * naive-ui 不会自己跟随站点的深浅色，需要把 darkTheme 交给 NConfigProvider。
 * 这里同时监听站点的主题切换和系统配色变化。
 */
export function useNaiveTheme() {
  const dark = ref(false)

  function sync() {
    const choice = currentChoice()
    dark.value = choice === 'dark'
      || (choice === 'auto' && matchMedia('(prefers-color-scheme: dark)').matches)
  }

  let media: MediaQueryList | undefined

  onMounted(() => {
    sync()
    media = matchMedia('(prefers-color-scheme: dark)')
    media.addEventListener('change', sync)
    window.addEventListener('theme-change', sync)
  })

  onUnmounted(() => {
    media?.removeEventListener('change', sync)
    window.removeEventListener('theme-change', sync)
  })

  return computed<GlobalTheme | null>(() => (dark.value ? darkTheme : null))
}
