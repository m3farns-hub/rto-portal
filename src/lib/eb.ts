// src/lib/eb.ts
import "server-only";
import { headers } from "next/headers";
import { getSessionToken } from "@/lib/cookies";

function getTenantFromHost(host?: string): string {
  if (!host) return "primary";
  const parts = host.split(".");
  return parts.length < 3 ? "primary" : parts[0];
}

export async function ebFetch(path: string, init?: RequestInit) {
  const EB = process.env.EB_API_BASE!;
  const h = await headers();

  const host = h.get("host") ?? "";
  const tenantHeader = h.get("x-tenant-id") ?? "";
  const tenant = tenantHeader || getTenantFromHost(host) || "primary";

  // Pull token from httpOnly session cookie and add Authorization if not provided
  const token = await getSessionToken();
  const hasAuth = !!(init?.headers as Record<string, string> | undefined)?.["Authorization"];

  const res = await fetch(`${EB}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      "X-Tenant-Id": tenant,
      ...(token && !hasAuth ? { Authorization: `Bearer ${token}` } : {}),
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

