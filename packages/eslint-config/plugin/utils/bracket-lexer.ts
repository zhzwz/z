export interface BracketPair {
  close: number
  open: number
  openChar: '{' | '['
}

function skipString(text: string, start: number): number {
  const quote = text[start]
  let i = start + 1
  while (i < text.length) {
    if (text[i] === '\\') {
      i += 2
      continue
    }
    if (text[i] === quote) {
      return i + 1
    }
    i++
  }
  return text.length
}

function skipLineComment(text: string, start: number): number {
  let i = start + 2
  while (i < text.length && text[i] !== '\n') {
    i++
  }
  return i
}

function skipBlockComment(text: string, start: number): number {
  let i = start + 2
  while (i < text.length - 1) {
    if (text[i] === '*' && text[i + 1] === '/') {
      return i + 2
    }
    i++
  }
  return text.length
}

function skipTemplateExpression(text: string, start: number): number {
  let i = start + 2
  let depth = 1

  while (i < text.length && depth > 0) {
    const skipped = skipCodeToken(text, i)
    if (skipped !== i) {
      i = skipped
      continue
    }

    const char = text[i]
    if (char === '{') {
      depth++
    } else if (char === '}') {
      depth--
      if (depth === 0) {
        return i + 1
      }
    }

    i++
  }

  return i
}

function skipTemplateLiteral(text: string, start: number): number {
  let i = start + 1

  while (i < text.length) {
    if (text[i] === '\\') {
      i += 2
      continue
    }
    if (text[i] === '$' && text[i + 1] === '{') {
      i = skipTemplateExpression(text, i)
      continue
    }
    if (text[i] === '`') {
      return i + 1
    }

    const skipped = skipCodeToken(text, i)
    if (skipped !== i) {
      i = skipped
      continue
    }

    i++
  }

  return text.length
}

function skipCodeToken(text: string, start: number): number {
  const char = text[start]

  if (char === '"' || char === '\'') {
    return skipString(text, start)
  }
  if (char === '`') {
    return skipTemplateLiteral(text, start)
  }
  if (char === '/' && text[start + 1] === '/') {
    return skipLineComment(text, start)
  }
  if (char === '/' && text[start + 1] === '*') {
    return skipBlockComment(text, start)
  }
  if (char === '$' && text[start + 1] === '{') {
    return skipTemplateExpression(text, start)
  }

  return start
}

export function containsLineComment(text: string): boolean {
  let i = 0

  while (i < text.length) {
    if (text[i] === '/' && text[i + 1] === '/') {
      return true
    }
    const skipped = skipCodeToken(text, i)
    i = skipped !== i
      ? skipped
      : i + 1
  }

  return false
}

export function findBracketPairs(text: string): BracketPair[] {
  const stack: Array<{ char: '{' | '[', pos: number }> = []
  const pairs: BracketPair[] = []
  let i = 0

  while (i < text.length) {
    const skipped = skipCodeToken(text, i)
    if (skipped !== i) {
      i = skipped
      continue
    }

    const char = text[i]

    if (char === '{' || char === '[') {
      stack.push({ pos: i, char })
      i++
      continue
    }
    if (char === '}' || char === ']') {
      const expected = char === '}'
        ? '{'
        : '['
      let top = stack.pop()
      while (top && top.char !== expected) {
        top = stack.pop()
      }
      if (top) {
        pairs.push({ open: top.pos, close: i, openChar: top.char })
      }
      i++
      continue
    }

    i++
  }

  return pairs
}
