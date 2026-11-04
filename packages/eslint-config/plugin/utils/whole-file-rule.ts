import type {
  LanguageOptions,
  RuleContext,
  RuleDefinition,
  RulesMeta,
} from '@eslint/core'
import type { RootNode, TextLinesSourceCode } from '../languages/text-lines'

type TextLinesRuleDefinition<Options extends unknown[] = unknown[]> = RuleDefinition<{
  Code: TextLinesSourceCode
  ExtRuleDocs: Record<string, unknown>
  LangOptions: LanguageOptions
  MessageIds: string
  Node: RootNode
  RuleOptions: Options
  Visitor: {
    Root?: (node: RootNode) => void
  }
}>

type TextLinesRuleContext<Options extends unknown[]> = RuleContext<{
  Code: TextLinesSourceCode
  LangOptions: LanguageOptions
  MessageIds: string
  Node: RootNode
  RuleOptions: Options
}>

interface WholeFileRuleConfig<Options extends unknown[] = unknown[]> {
  description: string
  message: string
  messageId: string
  schema?: RulesMeta['schema']
  transform: (text: string, options: Options) => string
}

export function createWholeFileRule<Options extends unknown[] = unknown[]>(
  config: WholeFileRuleConfig<Options>,
): TextLinesRuleDefinition<Options> {
  return {
    meta: {
      type: 'layout',
      docs: { description: config.description },
      fixable: 'code',
      schema: config.schema ?? [],
      messages: { [config.messageId]: config.message },
    },
    create(context: TextLinesRuleContext<Options>) {
      const { options, sourceCode } = context

      return {
        Root(node: RootNode) {
          const original = sourceCode.text
          const expected = config.transform(original, options)
          if (expected !== original) {
            context.report({
              node,
              messageId: config.messageId,
              fix: fixer => fixer.replaceTextRange([0, original.length], expected),
            })
          }
        },
      }
    },
  }
}
