import { cookies } from "next/headers";

export const SESSION_COOKIE = process.env.SESSION_COOKIE_NAME!;
const isProd = process.env.NODE_ENV === "production";
const COOKIE_DOMAIN = process.env.SESSION_COOKIE_DOMAIN || undefined; // e.g. ".ctrlrto.pro"

const BASE_OPTS = {
  httpOnly: true,
  secure: isProd,        // secure only in prod, so localhost works
  sameSite: "lax" as const,
  path: "/",
  maxAge: 60 * 60 * 8,
  // domain: set per call below (only if provided)
};

export async function getSessionToken(): Promise<string | null> {
  const c = await cookies();
  return c.get(SESSION_COOKIE)?.value ?? null;
}

export async function setSessionToken(token: string) {
  const c = await cookies();
  c.set(SESSION_COOKIE, token, COOKIE_DOMAIN ? { ...BASE_OPTS, domain: COOKIE_DOMAIN } : BASE_OPTS);
}

export async function clearSessionToken() {
  const c = await cookies();
  // Delete on the same domain attributes it was set with
  c.delete(SESSION_COOKIE, COOKIE_DOMAIN ? { domain: COOKIE_DOMAIN, path: "/" } : { path: "/" });
}
