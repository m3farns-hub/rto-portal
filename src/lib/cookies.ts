import { cookies } from "next/headers";

export const SESSION_COOKIE = process.env.SESSION_COOKIE_NAME!;
const isProd = process.env.NODE_ENV === "production";
// Only set DOMAIN in Production later when you’re ready to share across subdomains.
// For Preview/local, leave it undefined to avoid scope issues.
const COOKIE_DOMAIN = process.env.SESSION_COOKIE_DOMAIN || undefined;

const BASE = {
  httpOnly: true,
  secure: isProd,       // allow http://localhost
  sameSite: "lax" as const,
  path: "/",
  maxAge: 60 * 60 * 8,  // 8h
};

export async function getSessionToken(): Promise<string | null> {
  const c = await cookies();
  return c.get(SESSION_COOKIE)?.value ?? null;
}

export async function setSessionToken(token: string) {
  const c = await cookies();
  c.set(SESSION_COOKIE, token, COOKIE_DOMAIN ? { ...BASE, domain: COOKIE_DOMAIN } : BASE);
}

export async function clearSessionToken() {
  const c = await cookies();
  c.delete(SESSION_COOKIE, COOKIE_DOMAIN ? { domain: COOKIE_DOMAIN, path: "/" } : { path: "/" });
}

