// src/lib/eb.ts
import "server-only";
import { headers } from "next/headers";

function getTenantFromHost(host?: string): string {
  if (!host) return "primary";
  const parts = host.split(".");
  return parts.length < 3 ? "primary" : parts[0];
}

export async function ebFetch(path: string, init?: RequestInit) {
  const EB = process.env.EB_API_BASE!;
  const h = headers();

  // Prefer the header from middleware, but fall back to host parsing
  const tenant = h.get("x-tenant-id") || getTenantFromHost(h.get("host") || "") || "primary";

  const res = await fetch(`${EB}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      "X-Tenant-Id": tenant,
      ...(init?.headers || {}),
    },
    cache: "no-store",
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`${path} ${res.status}: ${text || res.statusText}`);
  }
  return res;
}
