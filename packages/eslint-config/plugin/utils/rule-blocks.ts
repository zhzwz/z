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

/**
 * 稳定排序；`conflicts(a, b)` 为真时，a 原本在 b 之前就必须仍在 b 之前。
 * 每次选出前面没有冲突块挡住的最小块，结果对自身再排序不变。
 */
export function sortRuleBlocks<T>(
  blocks: RuleBlock<T>[],
  compare: (a: RuleBlock<T>, b: RuleBlock<T>) => number,
  conflicts: (a: RuleBlock<T>, b: RuleBlock<T>) => boolean = () => false,
) {
  const pending = [...blocks]
  const sorted: RuleBlock<T>[] = []

  while (pending.length > 0) {
    let pick = 0
    for (let i = 1; i < pending.length; i++) {
      const candidate = pending[i]!
      if (compare(candidate, pending[pick]!) >= 0) {
        continue
      }
      if (pending.slice(0, i).some(earlier => conflicts(earlier, candidate))) {
        continue
      }
      pick = i
    }
    sorted.push(...pending.splice(pick, 1))
  }

  return sorted
}

export function flattenRuleBlocks<T>(blocks: RuleBlock<T>[], trailing: string[]) {
  const out: string[] = []
  for (const block of blocks) {
    out.push(...block.lead, block.rule)
  }
  out.push(...trailing)
  return out
}
