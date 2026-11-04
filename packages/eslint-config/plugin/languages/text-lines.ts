import type {
  File,
  Language,
  LanguageContext,
  LanguageOptions,
  OkParseResult,
  ParseResult,
  TextSourceCode,
} from '@eslint/core'

export interface RootNode {
  loc: {
    end: { column: number, line: number }
    start: { column: number, line: number }
  }
  range: [number, number]
  type: 'Root'
}

function getFileText(file: File): string {
  return typeof file.body === 'string'
    ? file.body
    : new TextDecoder().decode(file.body)
}

interface TextLinesSourceCodeOptions {
  ConfigNode: never
  LangOptions: LanguageOptions
  RootNode: RootNode
  SyntaxElementWithLoc: RootNode
}

export class TextLinesSourceCode implements TextSourceCode<TextLinesSourceCodeOptions> {
  text: string
  ast: RootNode

  constructor({ text, ast }: { ast: RootNode, text: string }) {
    this.text = text
    this.ast = ast
  }

  getLoc(node: RootNode) {
    return node.loc
  }

  getRange(node: RootNode): [number, number] {
    return node.range
  }

  * traverse() {
    yield { kind: 1 as const, target: this.ast, phase: 1 as const, args: [this.ast] }
    yield { kind: 1 as const, target: this.ast, phase: 2 as const, args: [this.ast] }
  }
}

type TextLinesLanguage = Language<{
  Code: TextLinesSourceCode
  LangOptions: LanguageOptions
  Node: RootNode
  RootNode: RootNode
}>

export const textLinesLanguage = {
  fileType: 'text' as const,
  lineStart: 1 as const,
  columnStart: 0 as const,
  nodeTypeKey: 'type',
  visitorKeys: { Root: [] as string[] },

  validateLanguageOptions() {},

  parse(file: File, _context: LanguageContext): ParseResult<RootNode> {
    const text = getFileText(file)
    const lines = text.split(/\r?\n/u)
    const ast: RootNode = {
      type: 'Root',
      range: [0, text.length],
      loc: {
        start: { line: 1, column: 0 },
        end: { line: lines.length, column: (lines.at(-1) ?? '').length },
      },
    }
    return { ok: true, ast }
  },

  createSourceCode(file: File, parseResult: OkParseResult<RootNode>, _context: LanguageContext) {
    return new TextLinesSourceCode({ text: getFileText(file), ast: parseResult.ast })
  },
} satisfies TextLinesLanguage
