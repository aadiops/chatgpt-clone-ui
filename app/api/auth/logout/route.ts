import { NextRequest, NextResponse } from 'next/server'
import { SESSION_COOKIE, createSessionValue, verifyCredentials } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const email = String(body?.email || '').trim()
    const password = String(body?.password || '')

    const user = verifyCredentials(email, password)
    if (!user) {
      return NextResponse.json({ error: 'Invalid email or password.' }, { status: 401 })
    }

    const response = NextResponse.json({ ok: true, user })
    response.cookies.set({
      name: SESSION_COOKIE,
      value: createSessionValue(user),
      httpOnly: true,
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
      secure: process.env.NODE_ENV === 'production',
    })

    return response
  } catch {
    return NextResponse.json({ error: 'Unable to process login request.' }, { status: 400 })
  }
}
