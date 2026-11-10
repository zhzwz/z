/**
 * 主题切换。默认跟随系统，用户选了浅色或深色后存进 localStorage 并覆盖系统设置。
 * 选择结果写在 <html data-z-theme> 上，站点样式和 ZnConfigProvider 都读它。
 */

import { isZAccentName, zAccentDefault, zAccents } from '@zhzwz/z/accent'
import { isZnThemeChoice, readZnTheme, setZnTheme } from '@zhzwz/z/components/zn-config-provider'

export type ThemeChoice = 'auto' | 'dark' | 'light'

const STORAGE_KEY = 'theme'
const ACCENT_KEY = 'accent'

export const choices: { label: string, value: ThemeChoice }[] = [
  { label: '跟随系统', value: 'auto' },
  { label: '浅色', value: 'light' },
  { label: '深色', value: 'dark' },
]

export function isThemeChoice(value: unknown): value is ThemeChoice {
  return isZnThemeChoice(value)
}

/** 在 head 里同步执行，避免先渲染浅色再跳成深色。 */
export const initScript = `
(function () {
  var choice = localStorage.getItem('${STORAGE_KEY}')
  document.documentElement.dataset.zTheme =
    choice === 'light' || choice === 'dark' ? choice : 'auto'
  var accent = localStorage.getItem('${ACCENT_KEY}')
  var accents = ${JSON.stringify(Object.keys(zAccents))}
  document.documentElement.dataset.zAccent = accents.indexOf(accent) >= 0 ? accent : '${zAccentDefault}'
})()
`

/** 强调色写在属性上，这里只负责记住上次的选择。 */
export function rememberAccent() {
  const save = () => {
    const value = document.documentElement.dataset.zAccent
    if (isZAccentName(value)) {
      localStorage.setItem(ACCENT_KEY, value)
    }
  }
  new MutationObserver(save).observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['data-z-accent'],
  })
}

export function currentChoice(): ThemeChoice {
  return readZnTheme()
}

export function setChoice(choice: ThemeChoice) {
  if (choice === 'auto') {
    localStorage.removeItem(STORAGE_KEY)
  } else {
    localStorage.setItem(STORAGE_KEY, choice)
  }
  setZnTheme(choice)
  window.dispatchEvent(new Event('theme-change'))
}

/** 返回取消订阅的函数。 */
export function onThemeChange(handler: (choice: ThemeChoice) => void) {
  const listener = () => handler(currentChoice())
  window.addEventListener('theme-change', listener)
  return () => window.removeEventListener('theme-change', listener)
}
