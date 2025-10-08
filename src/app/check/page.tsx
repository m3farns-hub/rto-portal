// src/app/check/page.tsx
export const dynamic = "force-dynamic";
export const revalidate = 0;

async function callEB(path: string, init?: RequestInit) {
  "use server";
  const base = process.env.EB_API_BASE!;
  const tenant = "primary";
  const res = await fetch(`${base}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      "X-Tenant-Id": tenant,
      ...(init?.headers || {}),
    },
    cache: "no-store",
  });
  const text = await res.text();
  let body: any = null;
  try { body = JSON.parse(text); } catch { body = text; }
  return { ok: res.ok, status: res.status, body };
}

export default async function CheckPage() {
  async function doStatus() { "use server"; return callEB("/status"); }
  async function doLogin() { "use server"; return callEB("/auth/login", { method:"POST", body: JSON.stringify({ email:"demo@you.com", password:"demo" }) }); }
  async function doRead(token?: string) { "use server"; return callEB("/actions/on-demand-read", { method:"POST", headers: token ? { Authorization:`Bearer ${token}` } : {} }); }

  const status = await doStatus();
  const login  = await doLogin();
  const token  = login?.body?.token as string | undefined;
  const read   = token ? await doRead(token) : { ok:false, status:401, body:"No token" };

  return (
    <main className="p-6 space-y-4">
      <h1 className="text-2xl font-semibold">Connectivity Check</h1>

      <section className="space-y-2">
        <h2 className="font-medium">/status</h2>
        <pre className="bg-neutral-100 p-3 rounded text-sm">{JSON.stringify(status, null, 2)}</pre>
      </section>

      <section className="space-y-2">
        <h2 className="font-medium">/auth/login</h2>
        <pre className="bg-neutral-100 p-3 rounded text-sm">{JSON.stringify(login, null, 2)}</pre>
      </section>

      <section className="space-y-2">
        <h2 className="font-medium">/actions/on-demand-read</h2>
        <pre className="bg-neutral-100 p-3 rounded text-sm">{JSON.stringify(read, null, 2)}</pre>
      </section>
    </main>
  );
}
