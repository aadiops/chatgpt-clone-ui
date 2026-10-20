export const SESSION_COOKIE = 'chatgpt_session'

export type UserSession = {
  email: string
  name: string
}

const users: Record<string, { password: string; name: string }> = {
  'demo@example.com': { password: 'demo123', name: 'Demo User' },
  'admin@example.com': { password: 'admin123', name: 'Admin User' },
}

export function verifyCredentials(email: string, password: string) {
  const normalizedEmail = email.trim().toLowerCase()
  const match = users[normalizedEmail]
  if (!match || match.password !== password) {
    return null
  }

  return { email: normalizedEmail, name: match.name }
}

export function createSessionValue(session: UserSession) {
  const payload = {
    email: session.email,
    name: session.name,
    exp: Date.now() + 1000 * 60 * 60 * 24 * 7,
  }

  return Buffer.from(JSON.stringify(payload)).toString('base64url')
}

export function getUserFromCookie(value?: string): UserSession | null {
  if (!value) return null

  try {
    const decoded = JSON.parse(Buffer.from(value, 'base64url').toString('utf8')) as {
      email?: string
      name?: string
      exp?: number
    }

    if (!decoded.email || !decoded.name || (decoded.exp && decoded.exp < Date.now())) {
      return null
    }

    return { email: decoded.email, name: decoded.name }
  } catch {
    return null
  }
}
