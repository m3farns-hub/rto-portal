// src/lib/cookies.ts
import { cookies } from "next/headers";

export const SESSION_COOKIE = process.env.SESSION_COOKIE_NAME!;
const isProd = process.env.NODE_ENV === "production";

const SESSION_OPTS = {
  httpOnly: true,
  secure: isProd,      // <-- only secure in prod
  sameSite: "lax" as const,
  path: "/",
  maxAge: 60 * 60 * 8,
};

export async function getSessionToken(): Promise<string | null> {
  const c = await cookies();
  return c.get(SESSION_COOKIE)?.value ?? null;
}

export async function setSessionToken(token: string) {
  const c = await cookies();
  c.set(SESSION_COOKIE, token, SESSION_OPTS);
}

export async function clearSessionToken() {
  const c = await cookies();
  c.delete(SESSION_COOKIE);
}
