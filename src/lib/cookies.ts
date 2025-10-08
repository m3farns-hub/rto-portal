import { cookies } from 'next/headers';

export const SESSION_COOKIE = process.env.SESSION_COOKIE_NAME!;
const SESSION_OPTS = {
  httpOnly: true,
  secure: true,
  sameSite: 'lax' as const,
  path: '/',
  // ~8 hours
  maxAge: 60 * 60 * 8,
};

export function getSessionToken(): string | null {
  return cookies().get(SESSION_COOKIE)?.value || null;
}

export function setSessionToken(token: string) {
  cookies().set(SESSION_COOKIE, token, SESSION_OPTS);
}

export function clearSessionToken() {
  cookies().delete(SESSION_COOKIE);
}
