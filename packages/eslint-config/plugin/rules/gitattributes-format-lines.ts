import { formatGitattributesLines } from '../utils/format-gitattributes'
import { DEFAULT_GITATTRIBUTES_PADDING } from '../utils/gitattributes'
import { createWholeFileRule } from '../utils/whole-file-rule'

interface GitattributesFormatLinesOptions {
  padding?: number
}

export const gitattributesFormatLinesRule = createWholeFileRule<[GitattributesFormatLinesOptions]>({
  description: '排序并对齐 .gitattributes（[attr] 宏定义置顶并按名称排序，规则行按「类别 → pattern」排序，再对齐列）',
  messageId: 'gitattributesUnformatted',
  message: '.gitattributes 未排序或列未对齐，可通过 --fix 自动修复。',
  schema: [
    {
      type: 'object',
      properties: {
        padding: { type: 'integer', minimum: 0 },
      },
      additionalProperties: false,
    },
  ],
  transform: (text, options) => formatGitattributesLines(text, options[0]?.padding ?? DEFAULT_GITATTRIBUTES_PADDING),
})
