import { describe, expect, it } from 'vitest'
import { isZAccentName, readZAccent, setZAccent, zAccentHex, zAccents, zAccentSteps, zAccentStyleSheet } from './accent'

describe('z accent scales', () => {
  it('keeps the tailwind v4 srgb fallback for the three accents', () => {
    expect(zAccentSteps).toEqual([
      50,
      100,
      200,
      300,
      400,
      500,
      600,
      700,
      800,
      900,
      950,
    ])
    expect(zAccentHex('blue', 500)).toBe('#2b7fff')
    expect(zAccentHex('blue', 600)).toBe('#155dfc')
    expect(zAccentHex('cyan', 500)).toBe('#00b8db')
    expect(zAccentHex('orange', 500)).toBe('#ff6900')
  })

  it('publishes every step as an oklch variable', () => {
    expect(zAccents.blue[500]).toBe('oklch(62.3% 0.214 259.815)')
    const sheet = zAccentStyleSheet()
    expect(sheet.match(/--z-theme-accent-\d+/g)).toHaveLength(zAccentSteps.length * Object.keys(zAccents).length)
    expect(sheet).toContain(`:root[data-z-accent='cyan']`)
    expect(sheet).toContain('oklch(70.5% 0.213 47.604)')
  })

  it('reads and writes data-z-accent', () => {
    document.documentElement.removeAttribute('data-z-accent')
    expect(readZAccent()).toBeNull()
    document.documentElement.dataset.zAccent = 'red'
    expect(isZAccentName('red')).toBe(false)
    expect(isZAccentName('toString')).toBe(false)
    expect(Object.keys(zAccents).every(isZAccentName)).toBe(true)
    expect(readZAccent()).toBeNull()
    setZAccent('orange')
    expect(readZAccent()).toBe('orange')
    document.documentElement.removeAttribute('data-z-accent')
  })
})
