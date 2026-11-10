export const zAccentSteps = [
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
] as const

export type ZAccentStep = (typeof zAccentSteps)[number]

type Oklch = readonly [lightness: number, chroma: number, hue: number]

// Tailwind 默认色板的 OKLCH。50 最浅，950 最深，不随亮暗对调。
const palettes = {
  blue: {
    '50': [97, 0.014, 254.604],
    '100': [93.2, 0.032, 255.585],
    '200': [88.2, 0.059, 254.128],
    '300': [80.9, 0.105, 251.813],
    '400': [70.7, 0.165, 254.624],
    '500': [62.3, 0.214, 259.815],
    '600': [54.6, 0.245, 262.881],
    '700': [48.8, 0.243, 264.376],
    '800': [42.4, 0.199, 265.638],
    '900': [37.9, 0.146, 265.522],
    '950': [28.2, 0.091, 267.935],
  },
  cyan: {
    '50': [98.4, 0.019, 200.873],
    '100': [95.6, 0.045, 203.388],
    '200': [91.7, 0.08, 205.041],
    '300': [86.5, 0.127, 207.078],
    '400': [78.9, 0.154, 211.53],
    '500': [71.5, 0.143, 215.221],
    '600': [60.9, 0.126, 221.723],
    '700': [52, 0.105, 223.128],
    '800': [45, 0.085, 224.283],
    '900': [39.8, 0.07, 227.392],
    '950': [30.2, 0.056, 229.695],
  },
  orange: {
    '50': [98, 0.016, 73.684],
    '100': [95.4, 0.038, 75.164],
    '200': [90.1, 0.076, 70.697],
    '300': [83.7, 0.128, 66.29],
    '400': [75, 0.183, 55.934],
    '500': [70.5, 0.213, 47.604],
    '600': [64.6, 0.222, 41.116],
    '700': [55.3, 0.195, 38.402],
    '800': [47, 0.157, 37.304],
    '900': [40.8, 0.123, 38.172],
    '950': [26.6, 0.079, 36.259],
  },
} as const satisfies Record<string, Record<ZAccentStep, Oklch>>

export type ZAccentName = keyof typeof palettes

export type ZAccentScale = Record<ZAccentStep, string>

function formatOklch([lightness, chroma, hue]: Oklch) {
  return `oklch(${lightness}% ${chroma} ${hue})`
}

export const zAccents: Record<ZAccentName, ZAccentScale> = Object.fromEntries(
  (Object.keys(palettes) as ZAccentName[]).map(name => [
    name,
    scaleOf(name),
  ]),
) as Record<ZAccentName, ZAccentScale>

function scaleOf(name: ZAccentName): ZAccentScale {
  return Object.fromEntries(zAccentSteps.map(step => [
    step,
    formatOklch(palettes[name][step]),
  ])) as ZAccentScale
}

export function isZAccentName(value: unknown): value is ZAccentName {
  return typeof value === 'string' && Object.hasOwn(palettes, value)
}

/** 没写 `<html data-z-accent>` 时用的强调色 */
export const zAccentDefault: ZAccentName = 'blue'

/** `<html data-z-accent>` 上的有效取值；没写或不认识时是 `null` */
export function readZAccent(): ZAccentName | null {
  if (typeof document === 'undefined') {
    return null
  }
  const value = document.documentElement.dataset.zAccent
  return isZAccentName(value)
    ? value
    : null
}

/** 只改 `<html data-z-accent>` */
export function setZAccent(name: ZAccentName) {
  if (typeof document === 'undefined') {
    return
  }
  document.documentElement.dataset.zAccent = name
}

export function zAccentHex(name: ZAccentName, step: ZAccentStep) {
  return hex(palettes[name][step])
}

export function zAccentStyleSheet() {
  return (Object.keys(palettes) as ZAccentName[]).map((name) => {
    const lines = zAccentSteps.map(step => `  --z-theme-accent-${step}: ${formatOklch(palettes[name][step])};`)
    return `:root[data-z-accent='${name}'] {\n${lines.join('\n')}\n}`
  }).join('\n')
}

const accentStyleId = 'z-accent'

export function installZAccentStyle() {
  if (typeof document === 'undefined' || document.getElementById(accentStyleId)) {
    return
  }
  const style = document.createElement('style')
  style.id = accentStyleId
  style.textContent = zAccentStyleSheet()
  document.head.appendChild(style)
}

function hex([lightness, chroma, hue]: Oklch) {
  const hueRadians = hue * Math.PI / 180
  const a = chroma * Math.cos(hueRadians)
  const b = chroma * Math.sin(hueRadians)
  const labL = lightness / 100
  const l = (labL + 0.3963377774 * a + 0.2158037573 * b) ** 3
  const m = (labL - 0.1055613458 * a - 0.0638541728 * b) ** 3
  const s = (labL - 0.0894841775 * a - 1.291485548 * b) ** 3
  return `#${[
    4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s,
  ].map(channelToByte).join('')}`
}

function channelToByte(linear: number) {
  const clamped = Math.min(Math.max(linear, 0), 1)
  const encoded = clamped <= 0.0031308
    ? 12.92 * clamped
    : 1.055 * clamped ** (1 / 2.4) - 0.055
  return Math.round(Math.min(Math.max(encoded, 0), 1) * 255).toString(16).padStart(2, '0')
}
