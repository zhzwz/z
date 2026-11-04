export const DEFAULT_GITATTRIBUTES_PADDING = 4

const CATEGORY_ORDER = [
  'text',
  'binary',
  'linguist-generated',
  'export-ignore',
] as const

const BUILTIN_MACROS: ReadonlyMap<string, readonly string[]> = new Map([
  [
    'binary',
    ['-diff', '-merge', '-text'],
  ],
])

/** eol 与已废弃的 crlf 会影响 text 的行为，视为同一属性 */
const ATTRIBUTE_ALIASES: ReadonlyMap<string, string> = new Map([
  ['crlf', 'text'],
  ['eol', 'text'],
])

export function categoryRank(tokens: string[]): number {
  for (let i = 0; i < CATEGORY_ORDER.length; i++) {
    const category = CATEGORY_ORDER[i]
    const hit = category === 'text'
      ? tokens.some(t => t === 'text' || t.startsWith('text='))
      : tokens.includes(category)
    if (hit) {
      return i
    }
  }
  return CATEGORY_ORDER.length
}

function attributeName(token: string): string {
  const name = token.replace(/^[-!]/u, '').split('=', 1)[0]!
  return ATTRIBUTE_ALIASES.get(name) ?? name
}

/** 宏会递归展开 */
export function affectedAttributes(
  tokens: readonly string[],
  macros: ReadonlyMap<string, readonly string[]>,
): Set<string> {
  const names = new Set<string>()
  const queue = [...tokens]

  while (queue.length > 0) {
    const name = attributeName(queue.shift()!)
    if (names.has(name)) {
      continue
    }
    names.add(name)
    const expansion = macros.get(name) ?? BUILTIN_MACROS.get(name)
    if (expansion) {
      queue.push(...expansion)
    }
  }

  return names
}

function literalSuffix(pattern: string): string {
  const lastSpecial = Math.max(...['*', '?', '[', ']', '\\'].map(char => pattern.lastIndexOf(char)))
  return pattern.slice(lastSpecial + 1).toLowerCase()
}

/** 两个 pattern 的字面后缀互不为后缀时，不可能匹配同一路径；其余情况保守视为可能重叠 */
export function patternsMayOverlap(a: string, b: string): boolean {
  const suffixA = literalSuffix(a)
  const suffixB = literalSuffix(b)
  return suffixA.endsWith(suffixB) || suffixB.endsWith(suffixA)
}
