export const DEFAULT_GITATTRIBUTES_PADDING = 4

const CATEGORY_ORDER = ['text', 'binary', 'linguist-generated', 'export-ignore'] as const

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
