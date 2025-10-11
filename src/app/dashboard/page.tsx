// src/app/dashboard/page.tsx
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getSessionToken, clearSessionToken } from "@/lib/cookies";

type LoginReply = { token: string };

export default async function Dashboard() {
  // Require login to view the page
  const initialToken = await getSessionToken();
  if (!initialToken) redirect("/sign-in");

  // Show API status via a simple direct fetch
  async function loadStatus() {
    "use server";
    const base = process.env.EB_API_BASE!;
    const res = await fetch(`${base}/status`, {
      headers: { "X-Tenant-Id": "primary", "Content-Type": "application/json" },
      cache: "no-store",
    });
    try {
      return await res.json();
    } catch {
      return { ok: false, error: "status parse failed" };
    }
  }
  const status = await loadStatus();

  // Always login inside the action (preview-safe), then call the action with explicit headers.
  async function runOnDemandRead() {
    "use server";
    const base = process.env.EB_API_BASE!;
    // 1) login for a fresh JWT
    const loginRes = await fetch(`${base}/auth/login`, {
      method: "POST",
      headers: { "X-Tenant-Id": "primary", "Content-Type": "application/json" },
      body: JSON.stringify({ email: "demo@you.com", password: "demo" }),
      cache: "no-store",
    });
    const login = (await loginRes.json()) as LoginReply;
    if (!login?.token) throw new Error(`Login failed or missing token: ${await loginRes.text()}`);

    // 2) call the action with explicit Authorization + tenant
    const actionRes = await fetch(`${base}/actions/on-demand-read`, {
      method: "POST",
      headers: {
        "X-Tenant-Id": "primary",
        "Content-Type": "application/json",
        Authorization: `Bearer ${login.token}`,
      },
      cache: "no-store",
    });
    if (!actionRes.ok) throw new Error(`/actions/on-demand-read ${actionRes.status}: ${await actionRes.text()}`);

    revalidatePath("/dashboard");
  }

  async function runOnDemandWrite() {
    "use server";
    const base = process.env.EB_API_BASE!;
    const loginRes = await fetch(`${base}/auth/login`, {
      method: "POST",
      headers: { "X-Tenant-Id": "primary", "Content-Type": "application/json" },
      body: JSON.stringify({ email: "demo@you.com", password: "demo" }),
      cache: "no-store",
    });
    const login = (await loginRes.json()) as LoginReply;
    if (!login?.token) throw new Error(`Login failed or missing token: ${await loginRes.text()}`);

    const actionRes = await fetch(`${base}/actions/on-demand-write`, {
      method: "POST",
      headers: {
        "X-Tenant-Id": "primary",
        "Content-Type": "application/json",
        Authorization: `Bearer ${login.token}`,
      },
      cache: "no-store",
    });
    if (!actionRes.ok) throw new Error(`/actions/on-demand-write ${actionRes.status}: ${await actionRes.text()}`);

    revalidatePath("/dashboard");
  }

  // Clear the cookie directly (no relative fetch) and redirect
  async function logout() {
    "use server";
    await clearSessionToken();
    redirect("/sign-in");
  }

  return (
    <main className="p-6 space-y-6">
      <h1 className="text-2xl font-semibold">Store Dashboard</h1>

      <div className="grid gap-4 md:grid-cols-2">
        <form action={runOnDemandRead}>
          <button className="w-full rounded bg-black text-white py-3">Run On-Demand Read</button>
        </form>
        <form action={runOnDemandWrite}>
          <button className="w-full rounded bg-black text-white py-3">Run On-Demand Write</button>
        </form>
      </div>

      <pre className="text-sm bg-neutral-100 p-3 rounded">{JSON.stringify(status, null, 2)}</pre>

      <form action={logout}>
        <button className="rounded border py-2 px-3">Sign out</button>
      </form>
    </main>
  );
}


