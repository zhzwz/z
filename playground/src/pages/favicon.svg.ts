import type { APIRoute } from 'astro'
import { faviconFile } from '../favicon.ts'

export const GET: APIRoute = () =>
  new Response(faviconFile(), {
    headers: { 'Content-Type': 'image/svg+xml' },
  })
