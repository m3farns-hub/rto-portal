// src/lib/eb.ts
import "server-only";
import { headers } from "next/headers";
import { getSessionToken } from "@/lib/cookies";

function getTenantFromHost(host?: string): string {
  if (!host) return "primary";
  const parts = host.split(".");
  return parts.length < 3 ? "primary" : parts[0];
}

export async function ebFetch(path: string, init: RequestInit = {}) {
  const EB = process.env.EB_API_BASE!;
  const h = await headers(); // Next 15
const host = (await headers()).get("host") ?? "";
const isVercelPreview = host.endsWith(".vercel.app");
const tenant = isVercelPreview ? "primary" : (h.get("x-tenant-id") ?? getTenantFromHost(host) ?? "primary");

  // Normalize incoming headers
  const incoming: Record<string, string> = {};
  if (init.headers instanceof Headers) {
    init.headers.forEach((v, k) => (incoming[k.toLowerCase()] = v));
  } else if (Array.isArray(init.headers)) {
    for (const [k, v] of init.headers) incoming[String(k).toLowerCase()] = String(v);
  } else if (init.headers && typeof init.headers === "object") {
    for (const k of Object.keys(init.headers as any)) incoming[k.toLowerCase()] = String((init.headers as any)[k]);
  }

  // Add Authorization from session if caller didn’t set it
  const hasAuth = "authorization" in incoming;
  const token = hasAuth ? null : await getSessionToken();

  const res = await fetch(`${EB}${path}`, {
    ...init,
    headers: {
      "content-type": incoming["content-type"] || "application/json",
      "x-tenant-id": tenant,
      ...(token ? { authorization: `Bearer ${token}` } : {}),
      ...incoming,
    },
    cache: "no-store",
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`${path} ${res.status}: ${text || res.statusText}`);
  }
  return res;
}


