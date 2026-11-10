import type { GlobalTheme } from 'naive-ui'
import type { Ref } from 'vue'
import { darkTheme } from 'naive-ui'
import { onMounted, onUnmounted, ref } from 'vue'

export type ZnThemeChoice = 'auto' | 'dark' | 'light'

export function isZnThemeChoice(value: unknown): value is ZnThemeChoice {
  return value === 'auto' || value === 'dark' || value === 'light'
}

/** `<html data-z-theme>` 的取值；没写或写了别的值时按 `auto` */
export function readZnTheme(): ZnThemeChoice {
  if (typeof document === 'undefined') {
    return 'auto'
  }
  const value = document.documentElement.dataset.zTheme
  return isZnThemeChoice(value)
    ? value
    : 'auto'
}

/** 只改 `<html data-z-theme>`。要在首屏之前生效，得在 head 里同步写同一个属性 */
export function setZnTheme(choice: ZnThemeChoice) {
  if (typeof document === 'undefined') {
    return
  }
  document.documentElement.dataset.zTheme = choice
}

function themeFromChoice(choice: ZnThemeChoice, prefersDark: boolean): GlobalTheme | null {
  return choice === 'dark' || (choice === 'auto' && prefersDark)
    ? darkTheme
    : null
}

/** 跟随 `data-z-theme` 与系统配色。服务端渲染时为浅色，挂载后再对齐。内层传 false，交给外层 */
export function useFollowedTheme(enabled = true): Ref<GlobalTheme | null> {
  const theme = ref<GlobalTheme | null>(null)
  let media: MediaQueryList | undefined
  let observer: MutationObserver | undefined

  function sync() {
    const prefersDark = typeof window.matchMedia === 'function'
      && window.matchMedia('(prefers-color-scheme: dark)').matches
    theme.value = themeFromChoice(readZnTheme(), prefersDark)
  }

  onMounted(() => {
    if (!enabled) {
      return
    }
    sync()
    if (typeof window.matchMedia === 'function') {
      media = window.matchMedia('(prefers-color-scheme: dark)')
      media.addEventListener('change', sync)
    }
    observer = new MutationObserver(sync)
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-z-theme'],
    })
  })

  onUnmounted(() => {
    media?.removeEventListener('change', sync)
    observer?.disconnect()
  })

  return theme
}
