import { glob } from 'astro/loaders'
import { z } from 'astro/zod'
import { defineCollection } from 'astro:content'

// 文档写在 src/content/docs 下，路由与侧边栏都由这里生成，不用维护页面清单。
const docs = defineCollection({
  loader: glob({ base: './src/content/docs', pattern: '**/*.mdx' }),
  schema: z.object({
    description: z.string().optional(),
    order: z.number().default(0),
    title: z.string(),
  }),
})

export const collections = { docs }
