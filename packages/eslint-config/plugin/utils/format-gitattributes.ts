import type { GitattributesMacroDefinition, GitattributesRuleEntry } from './parse-gitattributes-line'
import type { RuleBlock } from './rule-blocks'
import {
  affectedAttributes,
  categoryRank,
  DEFAULT_GITATTRIBUTES_PADDING,
  patternsMayOverlap,
} from './gitattributes'
import {
  formatGitattributesMacroDefinition,
  formatGitattributesRuleEntry,
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
  attributes: Set<string>
  entry: GitattributesRuleEntry
  pattern: string
  rank: number
}

function collectGitattributesSections(lines: string[]) {
  const macroBlocks: RuleBlock<GitattributesMacroDefinition>[] = []
  const ruleBlocks: RuleBlock<Omit<GitattributesRuleBlockMeta, 'attributes'>>[] = []
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
      rawPattern: parsed.rawPattern,
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

  const macros = new Map(macroBlocks.map(block => [block.meta.macroName, block.meta.attrs]))

  return {
    macroBlocks,
    ruleBlocks: ruleBlocks.map((block): RuleBlock<GitattributesRuleBlockMeta> => ({
      ...block,
      meta: { ...block.meta, attributes: affectedAttributes(block.meta.entry.attrs, macros) },
    })),
    trailing: lead,
  }
}

function rulesConflict(a: GitattributesRuleBlockMeta, b: GitattributesRuleBlockMeta): boolean {
  if (!patternsMayOverlap(a.pattern, b.pattern)) {
    return false
  }
  for (const name of a.attributes) {
    if (b.attributes.has(name)) {
      return true
    }
  }
  return false
}

export function formatGitattributesLines(
  text: string,
  padding: number = DEFAULT_GITATTRIBUTES_PADDING,
): string {
  const { hadFinalNewline, lines } = splitTextLines(text)
  const { macroBlocks, ruleBlocks, trailing } = collectGitattributesSections(lines)

  const sortedMacros = sortRuleBlocks(macroBlocks, (a, b) =>
    a.meta.macroName.localeCompare(b.meta.macroName, 'en', { sensitivity: 'base' }))
  const sortedRules = sortRuleBlocks(
    ruleBlocks,
    (a, b) => {
      if (a.meta.rank !== b.meta.rank) {
        return a.meta.rank - b.meta.rank
      }
      return a.meta.pattern.localeCompare(b.meta.pattern, 'en', { sensitivity: 'base' })
    },
    (a, b) => rulesConflict(a.meta, b.meta),
  )

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
    out.push(...block.lead, formatGitattributesRuleEntry(block.meta.entry, columnWidth))
  }
  out.push(...trailing)

  return joinTextLines(out, hadFinalNewline)
}
