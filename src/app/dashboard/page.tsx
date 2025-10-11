// src/app/dashboard/page.tsx
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { ebFetch } from "@/lib/eb";
import { getSessionToken, clearSessionToken } from "@/lib/cookies";

type LoginReply = { token: string };

export default async function Dashboard() {
  // Require login to view the page
  const initialToken = await getSessionToken();
  if (!initialToken) redirect("/sign-in");

  // Status block
  const status = await ebFetch("/status")
    .then((r) => r.json())
    .catch(() => ({ ok: false, error: "status fetch failed" }));

  // Server action: always log in (preview-safe), then run READ
  async function runOnDemandRead() {
    "use server";
    const login = await ebFetch("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email: "demo@you.com", password: "demo" }),
      headers: { "Content-Type": "application/json" },
    }).then((r) => r.json() as Promise<LoginReply>);

    await ebFetch("/actions/on-demand-read", {
      method: "POST",
      headers: { Authorization: `Bearer ${login.token}` },
    });

    revalidatePath("/dashboard");
  }

  // Server action: always log in (preview-safe), then run WRITE
  async function runOnDemandWrite() {
    "use server";
    const login = await ebFetch("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email: "demo@you.com", password: "demo" }),
      headers: { "Content-Type": "application/json" },
    }).then((r) => r.json() as Promise<LoginReply>);

    await ebFetch("/actions/on-demand-write", {
      method: "POST",
      headers: { Authorization: `Bearer ${login.token}` },
    });

    revalidatePath("/dashboard");
  }

  // Server action: clear the cookie directly (no relative fetch)
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
          <button className="w-full rounded bg-black text-white py-3">
            Run On-Demand Read
          </button>
        </form>

        <form action={runOnDemandWrite}>
          <button className="w-full rounded bg-black text-white py-3">
            Run On-Demand Write
          </button>
        </form>
      </div>

      <pre className="text-sm bg-neutral-100 p-3 rounded">
        {JSON.stringify(status, null, 2)}
      </pre>

      <form action={logout}>
        <button className="rounded border py-2 px-3">Sign out</button>
      </form>
    </main>
  );
}

