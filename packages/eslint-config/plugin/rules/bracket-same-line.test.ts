import { describe } from 'vitest'
import { createJsRuleTester, createVueRuleTester } from '../test/helpers'
import { bracketSameLineRule } from './bracket-same-line'

describe('bracket-same-line', () => {
  createJsRuleTester().run(
    'bracket-same-line',
    bracketSameLineRule,
    {
      valid: [
        'const x = { foo: 1 }',
        'const x = {\n  foo: 1,\n  bar: 2,\n}',
        'const s = "{ not a bracket }"',
        'const x = [1, 2, 3]',
        `const x = { foo: \`bar \${ { a: 1 } }\` }`,
        `const x = { tpl: \`\${\`inner \${[1, 2]}\`}\` }`,
        `const msg = \`value: \${items.map(x => { return x })}\``,
        'const x = [1, 2, // note\n]\n',
        'const x = { a: 1 // note\n}\n',
      ],
      invalid: [
        {
          code: 'const x = { foo: 1\n}\n',
          errors: [{ messageId: 'lonelyClose' }],
          output: 'const x = { foo: 1}\n',
        },
        {
          code: 'const x = [1, 2\n]\n',
          errors: [{ messageId: 'lonelyClose' }],
          output: 'const x = [1, 2]\n',
        },
        {
          code: 'const x = { a: { b: 1\n}\n}\n',
          errors: [{ messageId: 'lonelyClose' }, { messageId: 'lonelyClose' }],
          output: 'const x = { a: { b: 1}}\n',
        },
        {
          code: 'const a = { x: 1\n}\nconst b = { y: 2\n}\n',
          errors: [{ messageId: 'lonelyClose' }, { messageId: 'lonelyClose' }],
          output: 'const a = { x: 1}\nconst b = { y: 2}\n',
        },
        {
          code: 'const a = [1,\n]\n// eslint-disable-next-line rule-to-test/bracket-same-line\nconst keep = [2,\n]\n',
          errors: [{ messageId: 'lonelyClose' }],
          output: 'const a = [1]\n// eslint-disable-next-line rule-to-test/bracket-same-line\nconst keep = [2,\n]\n',
        },
      ],
    },
  )

  createVueRuleTester().run(
    'bracket-same-line vue',
    bracketSameLineRule,
    {
      valid: [
        {
          code: `<script setup>
const x = { foo: 1 }
</script>

<template>
  <div :class="{ active: true }" />
</template>
`,
          filename: 'test.vue',
        },
      ],
      invalid: [
        {
          code: `<script setup>
const x = { foo: 1
}
</script>

<template>
  <div :class="{ active: true
}" />
</template>
`,
          filename: 'test.vue',
          errors: [{ messageId: 'lonelyClose' }, { messageId: 'lonelyClose' }],
          output: `<script setup>
const x = { foo: 1}
</script>

<template>
  <div :class="{ active: true}" />
</template>
`,
        },
        {
          code: `<template>
  <div :items="[1, 2
]" />
</template>
`,
          filename: 'test.vue',
          errors: [{ messageId: 'lonelyClose' }],
          output: `<template>
  <div :items="[1, 2]" />
</template>
`,
        },
      ],
    },
  )
})
