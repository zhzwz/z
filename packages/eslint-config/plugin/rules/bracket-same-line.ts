import type { Rule } from 'eslint'
import type { BracketPair } from '../utils/bracket-lexer'
import { findBracketPairs } from '../utils/bracket-lexer'

interface BracketCollapseNode {
  range: [number, number]
  type?: string
}

interface VueProgramNode extends BracketCollapseNode {
  templateBody?: unknown
  type: string
}

function lonelyCloseBody(inner: string): string | null {
  const newlineIndex = Math.max(inner.lastIndexOf('\n'), inner.lastIndexOf('\r'))
  if (newlineIndex === -1) {
    return null
  }
  const tail = inner.slice(newlineIndex)
  if (!/^(?:\r\n|\n|\r)[ \t]*$/.test(tail)) {
    return null
  }
  return inner.slice(0, newlineIndex).replace(/,[ \t]*$/, '')
}

function collapseInnerLonelyBrackets(inner: string): string {
  let current = inner

  while (true) {
    const pairs = findBracketPairs(current)
    let changed = false

    for (const pair of pairs.sort((a, b) => b.open - a.open)) {
      const body = lonelyCloseBody(current.slice(pair.open + 1, pair.close))
      if (body === null || body.includes('\n') || body.includes('\r')) {
        continue
      }

      const replacement = `${current[pair.open]}${body.trimEnd()}${current[pair.close]}`
      current = current.slice(0, pair.open) + replacement + current.slice(pair.close + 1)
      changed = true
      break
    }

    if (!changed) {
      return current
    }
  }
}

function collapseLonelyClosingBracket(text: string, pair: BracketPair): string | null {
  const closeChar = text[pair.close]
  const inner = collapseInnerLonelyBrackets(text.slice(pair.open + 1, pair.close))
  const body = lonelyCloseBody(inner)

  if (body === null || body.includes('\n') || body.includes('\r')) {
    return null
  }

  return `${text[pair.open]}${body.trimEnd()}${closeChar}`
}

function findBracketCollapses(text: string): Array<{ range: [number, number], text: string }> {
  const fixes: Array<{ range: [number, number], text: string }> = []

  for (const pair of findBracketPairs(text)) {
    const original = text.slice(pair.open, pair.close + 1)
    const replacement = collapseLonelyClosingBracket(text, pair)
    if (!replacement || replacement === original) {
      continue
    }
    fixes.push({
      range: [pair.open, pair.close + 1],
      text: replacement,
    })
  }

  return fixes.sort((a, b) => b.range[0] - a.range[0])
}

function collapseAllLonelyBrackets(text: string): string {
  let current = text

  while (true) {
    const fixes = findBracketCollapses(current)
    if (fixes.length === 0) {
      return current
    }

    const fix = fixes[0]!
    current = current.slice(0, fix.range[0]) + fix.text + current.slice(fix.range[1])
  }
}

function isVueFile(filename: string | undefined): boolean {
  return filename?.endsWith('.vue') ?? false
}

function isVueAstNode(node: unknown): node is { type: string } {
  return typeof node === 'object' && node !== null && 'type' in node && typeof node.type === 'string'
}

const VUE_CHILD_KEYS = [
  'attributes',
  'body',
  'children',
  'endTag',
  'expression',
  'key',
  'modifiers',
  'startTag',
  'value',
] as const

function collectVueTemplateExpressions(root: unknown): BracketCollapseNode[] {
  const expressions: BracketCollapseNode[] = []
  const queue: unknown[] = [root]
  const visited = new Set<unknown>()

  while (queue.length > 0) {
    const current = queue.shift()
    if (!isVueAstNode(current) || visited.has(current)) {
      continue
    }
    visited.add(current)

    if (current.type === 'VExpressionContainer') {
      const expression = (current as { expression?: BracketCollapseNode | null }).expression
      if (expression?.range) {
        expressions.push(expression)
      }
    }

    for (const key of VUE_CHILD_KEYS) {
      const value = (current as Record<string, unknown>)[key]
      if (Array.isArray(value)) {
        queue.push(...value)
        continue
      }
      if (isVueAstNode(value)) {
        queue.push(value)
      }
    }
  }

  return expressions
}

function reportBracketCollapses(
  context: Rule.RuleContext,
  sourceCode: Rule.RuleContext['sourceCode'],
  node: BracketCollapseNode,
): void {
  const eslintNode = node as Parameters<typeof sourceCode.getText>[0]
  const text = sourceCode.getText(eslintNode)
  const fixes = findBracketCollapses(text)
  if (fixes.length === 0) {
    return
  }

  const finalText = collapseAllLonelyBrackets(text)
  const baseOffset = node.range[0]

  for (const fix of fixes) {
    const start = sourceCode.getLocFromIndex(baseOffset + fix.range[0])
    const end = sourceCode.getLocFromIndex(baseOffset + fix.range[1])
    context.report({
      loc: { start, end },
      messageId: 'lonelyClose',
      fix: fixer => fixer.replaceText(eslintNode, finalText),
    })
  }
}

function createBracketVisitors(context: Rule.RuleContext) {
  const { sourceCode } = context

  return {
    Program(node: VueProgramNode) {
      reportBracketCollapses(context, sourceCode, node)

      if (!isVueFile(context.filename) || !node.templateBody) {
        return
      }

      for (const expression of collectVueTemplateExpressions(node.templateBody)) {
        reportBracketCollapses(context, sourceCode, expression)
      }
    },
  }
}

export const bracketSameLineRule: Rule.RuleModule = {
  meta: {
    type: 'layout',
    docs: {
      description: 'When {}/[] content is single-line, disallow a line break before the closing bracket.',
    },
    fixable: 'code',
    schema: [],
    messages: {
      lonelyClose: 'Remove the line break before the closing bracket when the bracket content is single-line.',
    },
  },
  create(context) {
    return createBracketVisitors(context)
  },
}
