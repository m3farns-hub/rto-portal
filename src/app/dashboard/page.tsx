// src/app/dashboard/page.tsx
export const runtime = "nodejs"; // ensure Node runtime for server actions

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getSessionToken, clearSessionToken } from "@/lib/cookies";

type LoginReply = { token?: string };
type Json = Record<string, unknown> | string | null;

async function apiFetch(path: string, init?: RequestInit) {
  "use server";
  const base = process.env.EB_API_BASE!;
  const res = await fetch(`${base}${path}`, {
    ...init,
    headers: {
      "X-Tenant-Id": "primary",
      "Content-Type": "application/json",
      ...(init?.headers || {}),
    },
    cache: "no-store",
  });
  return res;
}

async function getJson(res: Response): Promise<Json> {
  const text = await res.text();
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

export default async function Dashboard() {
  // Require login to view page
  const initialToken = await getSessionToken();
  if (!initialToken) redirect("/sign-in");

  // Load status (non-fatal)
  const status = await (async () => {
    try {
      const r = await apiFetch("/status");
      return await getJson(r);
    } catch {
      return { ok: false, error: "status fetch failed" };
    }
  })();

  // Always login inside the action to get a fresh token (preview-safe)
  async function runOnDemandRead() {
    "use server";
    const loginRes = await apiFetch("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email: "demo@you.com", password: "demo" }),
    });
    const loginBody = (await getJson(loginRes)) as LoginReply;

    if (!loginRes.ok) {
      throw new Error(`LOGIN FAILED ${loginRes.status}: ${JSON.stringify(loginBody)}`);
    }
    if (!loginBody?.token) {
      throw new Error(`LOGIN MISSING TOKEN: ${JSON.stringify(loginBody)}`);
    }

    const actRes = await apiFetch("/actions/on-demand-read", {
      method: "POST",
      headers: { Authorization: `Bearer ${loginBody.token}` },
    });
    if (!actRes.ok) {
      const body = await getJson(actRes);
      throw new Error(`/actions/on-demand-read ${actRes.status}: ${JSON.stringify(body)}`);
    }

    revalidatePath("/dashboard");
  }

  async function runOnDemandWrite() {
    "use server";
    const loginRes = await apiFetch("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email: "demo@you.com", password: "demo" }),
    });
    const loginBody = (await getJson(loginRes)) as LoginReply;

    if (!loginRes.ok) {
      throw new Error(`LOGIN FAILED ${loginRes.status}: ${JSON.stringify(loginBody)}`);
    }
    if (!loginBody?.token) {
      throw new Error(`LOGIN MISSING TOKEN: ${JSON.stringify(loginBody)}`);
    }

    const actRes = await apiFetch("/actions/on-demand-write", {
      method: "POST",
      headers: { Authorization: `Bearer ${loginBody.token}` },
    });
    if (!actRes.ok) {
      const body = await getJson(actRes);
      throw new Error(`/actions/on-demand-write ${actRes.status}: ${JSON.stringify(body)}`);
    }

    revalidatePath("/dashboard");
  }

  // Clear cookie directly (no relative fetch) and go to sign-in
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


