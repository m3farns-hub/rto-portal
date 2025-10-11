// src/app/dashboard/page.tsx
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { ebFetch } from "@/lib/eb";
import { getSessionToken } from "@/lib/cookies";

export default async function Dashboard() {
  // Require login for initial render
  const initialToken = await getSessionToken();
  if (!initialToken) redirect("/sign-in");

  // Show API status
  const status = await ebFetch("/status")
    .then((r) => r.json())
    .catch(() => ({ ok: false, error: "status fetch failed" }));

  // --- Server Actions ---
  async function runOnDemandRead() {
    "use server";
    try {
      const token = await getSessionToken();
      if (!token) throw new Error("No session token — please sign in again.");
      await ebFetch("/actions/on-demand-read", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch (err) {
      console.error("runOnDemandRead error:", err);
      // Re-throw to show a digest page (so we can see the error in Vercel logs)
      throw err;
    } finally {
      revalidatePath("/dashboard");
    }
  }

  async function runOnDemandWrite() {
    "use server";
    try {
      const token = await getSessionToken();
      if (!token) throw new Error("No session token — please sign in again.");
      await ebFetch("/actions/on-demand-write", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch (err) {
      console.error("runOnDemandWrite error:", err);
      throw err;
    } finally {
      revalidatePath("/dashboard");
    }
  }

  async function logout() {
    "use server";
    try {
      // Hit our API route to clear cookie
      await fetch("/api/auth/logout", { method: "POST" });
    } finally {
      redirect("/sign-in");
    }
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

