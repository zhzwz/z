export interface GitattributesRuleParts {
  attrs: string[]
  pattern: string
}

export type GitattributesLineKind = 'macro-definition' | 'rule'

export interface GitattributesLineParse {
  attrs: string[]
  kind: GitattributesLineKind
  macroName: string
  pattern: string
}

export interface GitattributesRuleEntry {
  attrs: string[]
  pattern: string
}

export interface GitattributesMacroDefinition {
  attrs: string[]
  macroName: string
}

const MACRO_DEFINITION_PREFIX = '[attr]'

function readQuotedField(text: string, start: number): { end: number, value: string } {
  let i = start + 1
  let value = ''
  while (i < text.length) {
    if (text[i] === '\\' && i + 1 < text.length) {
      value += text[i + 1]
      i += 2
      continue
    }
    if (text[i] === '"') {
      return { value, end: i + 1 }
    }
    value += text[i]
    i++
  }
  return { value, end: i }
}

function readUnquotedField(text: string, start: number): { end: number, value: string } {
  let i = start
  let value = ''
  while (i < text.length) {
    if (text[i] === '\\' && i + 1 < text.length) {
      value += text[i + 1]
      i += 2
      continue
    }
    if (/\s/u.test(text[i])) {
      break
    }
    value += text[i]
    i++
  }
  return { value, end: i }
}

function skipWhitespace(text: string, start: number): number {
  let i = start
  while (i < text.length && /\s/u.test(text[i])) {
    i++
  }
  return i
}

function readAttributeTokens(text: string, start: number): string[] {
  const attrs: string[] = []
  let i = skipWhitespace(text, start)

  while (i < text.length) {
    const field = text[i] === '"'
      ? readQuotedField(text, i)
      : readUnquotedField(text, i)
    if (field.value !== '') {
      attrs.push(field.value)
    }
    i = skipWhitespace(text, field.end)
  }

  return attrs
}

export function isGitattributesMacroDefinitionLine(line: string): boolean {
  return line.trimStart().startsWith(MACRO_DEFINITION_PREFIX)
}

export function parseGitattributesLine(line: string): GitattributesLineParse {
  const text = line.trim()
  if (text === '') {
    return { kind: 'rule', pattern: '', attrs: [], macroName: '' }
  }

  if (isGitattributesMacroDefinitionLine(text)) {
    const afterPrefix = skipWhitespace(text, MACRO_DEFINITION_PREFIX.length)
    const nameField = text[afterPrefix] === '"'
      ? readQuotedField(text, afterPrefix)
      : readUnquotedField(text, afterPrefix)

    return {
      kind: 'macro-definition',
      macroName: nameField.value,
      pattern: '',
      attrs: readAttributeTokens(text, nameField.end),
    }
  }

  const patternField = text[0] === '"'
    ? readQuotedField(text, 0)
    : readUnquotedField(text, 0)

  return {
    kind: 'rule',
    pattern: patternField.value,
    attrs: readAttributeTokens(text, patternField.end),
    macroName: '',
  }
}

export function parseGitattributesRuleLine(line: string): GitattributesRuleParts {
  const parsed = parseGitattributesLine(line)
  if (parsed.kind === 'macro-definition') {
    return {
      pattern: `${MACRO_DEFINITION_PREFIX}${parsed.macroName}`,
      attrs: parsed.attrs,
    }
  }

  return {
    pattern: parsed.pattern,
    attrs: parsed.attrs,
  }
}

function needsQuoting(pattern: string): boolean {
  return pattern === '' || /[\s"]/u.test(pattern)
}

export function formatGitattributesPattern(pattern: string): string {
  if (!needsQuoting(pattern)) {
    return pattern
  }
  return `"${pattern.replace(/\\/gu, '\\\\').replace(/"/gu, '\\"')}"`
}

export function formatGitattributesMacroDefinition(
  definition: GitattributesMacroDefinition,
  columnWidth?: number,
): string {
  const prefix = `${MACRO_DEFINITION_PREFIX}${definition.macroName}`
  const attrsText = definition.attrs.join(' ')
  if (attrsText === '') {
    return prefix
  }
  if (columnWidth === undefined) {
    return `${prefix} ${attrsText}`
  }
  return prefix.padEnd(columnWidth) + attrsText
}

export function gitattributesMacroDefinitionWidth(definition: GitattributesMacroDefinition): number {
  return `${MACRO_DEFINITION_PREFIX}${definition.macroName}`.length
}

export function gitattributesRuleEntryWidth(entry: GitattributesRuleEntry): number {
  return formatGitattributesPattern(entry.pattern).length
}

export function formatGitattributesRuleLine(
  pattern: string,
  attrs: string[],
  columnWidth?: number,
): string {
  const patternField = formatGitattributesPattern(pattern)
  if (attrs.length === 0) {
    return patternField
  }
  const attrsText = attrs.join(' ')
  if (columnWidth === undefined) {
    return `${patternField} ${attrsText}`
  }
  return patternField.padEnd(columnWidth) + attrsText
}
