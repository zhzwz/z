import { RuleTester } from 'eslint'
import { describe, it } from 'vitest'
import vueParser from 'vue-eslint-parser'
import plugin from '../index'

RuleTester.describe = describe
RuleTester.it = it
RuleTester.itOnly = it.only

export function createTextLinesRuleTester(language: 'zhzwz/gitignore' | 'zhzwz/gitattributes') {
  return new RuleTester({
    plugins: { zhzwz: plugin },
    language,
  })
}

export function createJsRuleTester() {
  return new RuleTester({
    plugins: { zhzwz: plugin },
  })
}

export function createVueRuleTester() {
  return new RuleTester({
    plugins: { zhzwz: plugin },
    languageOptions: {
      parser: vueParser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
      },
    },
  })
}
