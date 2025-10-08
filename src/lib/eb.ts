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
  const h = await headers(); // <-- Next 15: await this
  const host = h.get("host") ?? "";
  const tenantHeader = h.get("x-tenant-id") ?? "";
  const tenant = tenantHeader || getTenantFromHost(host) || "primary";

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
ew Error(`${path} ${res.status}: ${text || res.statusText}`);
  }
  return res;
}
