import { NextResponse, NextRequest } from "next/server";

function getTenantFromHost(host?: string): string {
  if (!host) return "primary";
  const parts = host.split(".");
  return parts.length < 3 ? "primary" : parts[0];
}

export function middleware(req: NextRequest) {
  const url = new URL(req.url);
  const host = req.headers.get("host") || "";

  // Redirect www -> apex
  if (host.startsWith("www.")) {
    url.host = host.slice(4); // drop "www."
    return NextResponse.redirect(url, 308);
  }

  const tenant = getTenantFromHost(host);
  const requestHeaders = new Headers(req.headers);
  requestHeaders.set("x-tenant-id", tenant);

  return NextResponse.next({ request: { headers: requestHeaders } });
}

export const config = {
  matcher: ["/((?!_next|.*\\..*|api/health).*)"],
};
