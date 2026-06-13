// app/api/[...path]/route.ts
// Catch-all proxy route — forwards all requests to the NestJS backend.
// Replaces next.config.ts rewrites to avoid ECONNRESET on PATCH with body.

import { NextRequest, NextResponse } from 'next/server'

const BACKEND = process.env.BACKEND_URL ?? 'http://localhost:8011/api'

type Context = { params: Promise<{ path: string[] }> }

async function proxy(req: NextRequest, ctx: Context): Promise<NextResponse> {
  const { path } = await ctx.params
  const target = `${BACKEND}/${path.join('/')}${req.nextUrl.search}`

  
  // Forward only safe headers — strip host to avoid conflicts
  const forwardHeaders = new Headers()
  forwardHeaders.set('Content-Type', 'application/json')

  const auth = req.headers.get('Authorization')
  if (auth) forwardHeaders.set('Authorization', auth)

  const hasBody = !['GET', 'HEAD', 'DELETE'].includes(req.method)
  const body = hasBody ? await req.text() : undefined

  let res: Response
  try {
    res = await fetch(target, {
      method:  req.method,
      headers: forwardHeaders,
      body,
    })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Backend unreachable'
    return NextResponse.json({ error: msg }, { status: 502 })
  }

  // 204 No Content (and 205/304) must not have a body
  if (res.status === 204 || res.status === 205 || res.status === 304) {
    return new NextResponse(null, { status: res.status })
  }

  const contentType = res.headers.get('Content-Type') ?? 'application/json'
  const responseBody = await res.arrayBuffer()

  return new NextResponse(responseBody, {
    status: res.status,
    headers: { 'Content-Type': contentType },
  })
}

export const GET     = proxy
export const POST    = proxy
export const PUT     = proxy
export const PATCH   = proxy
export const DELETE  = proxy
export const OPTIONS = proxy
