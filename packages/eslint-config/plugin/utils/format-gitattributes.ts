import type { GitattributesMacroDefinition, GitattributesRuleEntry } from './parse-gitattributes-line'
import type { RuleBlock } from './rule-blocks'
import { categoryRank, DEFAULT_GITATTRIBUTES_PADDING } from './gitattributes'
import {
  formatGitattributesMacroDefinition,
  formatGitattributesRuleLine,
  gitattributesMacroDefinitionWidth,
  gitattributesRuleEntryWidth,
  parseGitattributesLine,
} from './parse-gitattributes-line'
import {
  isRuleLine,
  joinTextLines,
  sortRuleBlocks,
  splitTextLines,
} from './rule-blocks'

interface GitattributesRuleBlockMeta {
  entry: GitattributesRuleEntry
  pattern: string
  rank: number
}

function collectGitattributesSections(lines: string[]) {
  const macroBlocks: RuleBlock<GitattributesMacroDefinition>[] = []
  const ruleBlocks: RuleBlock<GitattributesRuleBlockMeta>[] = []
  let lead: string[] = []

  for (const line of lines) {
    if (!isRuleLine(line)) {
      lead.push(line)
      continue
    }

    const parsed = parseGitattributesLine(line)
    if (parsed.kind === 'macro-definition') {
      macroBlocks.push({
        lead,
        rule: '',
        meta: {
          macroName: parsed.macroName,
          attrs: parsed.attrs,
        },
      })
      lead = []
      continue
    }

    const entry: GitattributesRuleEntry = {
      pattern: parsed.pattern,
      attrs: parsed.attrs,
    }
    ruleBlocks.push({
      lead,
      rule: '',
      meta: {
        entry,
        pattern: entry.pattern,
        rank: categoryRank(entry.attrs),
      },
    })
    lead = []
  }

  return { macroBlocks, ruleBlocks, trailing: lead }
}

export function formatGitattributesLines(
  text: string,
  padding: number = DEFAULT_GITATTRIBUTES_PADDING,
): string {
  const { hadFinalNewline, lines } = splitTextLines(text)
  const { macroBlocks, ruleBlocks, trailing } = collectGitattributesSections(lines)

  const sortedMacros = sortRuleBlocks(macroBlocks, (a, b) =>
    a.meta.macroName.localeCompare(b.meta.macroName, 'en', { sensitivity: 'base' }))
  const sortedRules = sortRuleBlocks(ruleBlocks, (a, b) => {
    if (a.meta.rank !== b.meta.rank) {
      return a.meta.rank - b.meta.rank
    }
    return a.meta.pattern.localeCompare(b.meta.pattern, 'en', { sensitivity: 'base' })
  })

  let maxPatternLength = 0
  for (const block of sortedMacros) {
    const width = gitattributesMacroDefinitionWidth(block.meta)
    if (width > maxPatternLength) {
      maxPatternLength = width
    }
  }
  for (const block of sortedRules) {
    const width = gitattributesRuleEntryWidth(block.meta.entry)
    if (width > maxPatternLength) {
      maxPatternLength = width
    }
  }
  const columnWidth = maxPatternLength + padding

  const out: string[] = []
  for (const block of sortedMacros) {
    out.push(...block.lead, formatGitattributesMacroDefinition(block.meta, columnWidth))
  }
  for (const block of sortedRules) {
    out.push(
      ...block.lead,
      formatGitattributesRuleLine(block.meta.entry.pattern, block.meta.entry.attrs, columnWidth),
    )
  }
  out.push(...trailing)

  return joinTextLines(out, hadFinalNewline)
}
