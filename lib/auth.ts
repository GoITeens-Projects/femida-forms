import { cookies } from 'next/headers'
import type { User } from './types'

const SESSION_COOKIE = 'form_session'

export async function getSession(): Promise<User | null> {
  const cookieStore = await cookies()
  const sessionCookie = cookieStore.get(SESSION_COOKIE)
  
  if (!sessionCookie?.value) return null
  
  try {
    return JSON.parse(sessionCookie.value) as User
  } catch {
    return null
  }
}

export async function setSession(user: User): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.set(SESSION_COOKIE, JSON.stringify(user), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 1 week
    path: '/',
  })
}

export async function clearSession(): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.delete(SESSION_COOKIE)
}

export function isAdmin(user: User | null): boolean {
  return user?.role === 'ADMIN'
}
