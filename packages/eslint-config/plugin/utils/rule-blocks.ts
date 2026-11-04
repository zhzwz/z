export function isRuleLine(line: string): boolean {
  const trimmed = line.trim()
  return trimmed !== '' && !trimmed.startsWith('#')
}

export interface RuleBlock<T = void> {
  lead: string[]
  meta: T
  rule: string
}

export function splitTextLines(text: string) {
  const hadFinalNewline = text.endsWith('\n')
  const lines = text.split('\n').map((line) => {
    return line.endsWith('\r') ? line.slice(0, -1) : line
  })
  if (hadFinalNewline && lines.at(-1) === '') {
    lines.pop()
  }
  return { hadFinalNewline, lines }
}

export function joinTextLines(lines: string[], hadFinalNewline: boolean) {
  return lines.join('\n') + (hadFinalNewline ? '\n' : '')
}

export function collectRuleBlocks<T>(
  lines: string[],
  parseMeta: (ruleLine: string) => T,
) {
  const blocks: RuleBlock<T>[] = []
  let pending: string[] = []

  for (const line of lines) {
    if (!isRuleLine(line)) {
      pending.push(line)
      continue
    }
    blocks.push({ lead: pending, rule: line, meta: parseMeta(line) })
    pending = []
  }

  return { blocks, trailing: pending }
}

export function sortRuleBlocks<T>(
  blocks: RuleBlock<T>[],
  compare: (a: RuleBlock<T>, b: RuleBlock<T>) => number,
) {
  return blocks
    .map((block, index) => ({ block, index }))
    .sort((a, b) => {
      const byCompare = compare(a.block, b.block)
      return byCompare !== 0 ? byCompare : a.index - b.index
    })
    .map(item => item.block)
}

export function flattenRuleBlocks<T>(blocks: RuleBlock<T>[], trailing: string[]) {
  const out: string[] = []
  for (const block of blocks) {
    out.push(...block.lead, block.rule)
  }
  out.push(...trailing)
  return out
}
