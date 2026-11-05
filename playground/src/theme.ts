/**
 * 主题切换。默认跟随系统，用户选了浅色或深色后存进 localStorage 并覆盖系统设置。
 * 选择结果写在 <html data-theme-choice> 上，深浅两套令牌的取舍全部由 CSS 完成。
 */

export type ThemeChoice = 'auto' | 'dark' | 'light'

const STORAGE_KEY = 'theme'

export const choices: { label: string, value: ThemeChoice }[] = [
  { label: '跟随系统', value: 'auto' },
  { label: '浅色', value: 'light' },
  { label: '深色', value: 'dark' },
]

export function isThemeChoice(value: unknown): value is ThemeChoice {
  return value === 'auto' || value === 'light' || value === 'dark'
}

/** 在 head 里同步执行，避免先渲染浅色再跳成深色。 */
export const initScript = `
(function () {
  var choice = localStorage.getItem('${STORAGE_KEY}')
  document.documentElement.dataset.themeChoice =
    choice === 'light' || choice === 'dark' ? choice : 'auto'
})()
`

export function currentChoice(): ThemeChoice {
  const value = document.documentElement.dataset.themeChoice
  if (isThemeChoice(value)) {
    return value
  }
  return 'auto'
}

export function setChoice(choice: ThemeChoice) {
  if (choice === 'auto') {
    localStorage.removeItem(STORAGE_KEY)
  } else {
    localStorage.setItem(STORAGE_KEY, choice)
  }
  document.documentElement.dataset.themeChoice = choice
  window.dispatchEvent(new Event('theme-change'))
}

/** 返回取消订阅的函数。 */
export function onThemeChange(handler: (choice: ThemeChoice) => void) {
  const listener = () => handler(currentChoice())
  window.addEventListener('theme-change', listener)
  return () => window.removeEventListener('theme-change', listener)
}
