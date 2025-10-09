// src/app/dashboard/page.tsx
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { ebFetch } from "@/lib/eb";
import { getSessionToken } from "@/lib/cookies";
import { ActionButton } from "@/components/ActionButton";

export default async function Dashboard() {
  // Require login
  const token = await getSessionToken();
  if (!token) redirect("/sign-in");

  // Load API status on each render
  const status = await ebFetch("/status")
    .then((r) => r.json())
    .catch(() => ({ ok: false }));

  // --- Server actions (top-level functions referenced by formAction) ---
  async function runOnDemandRead() {
    "use server";
    await ebFetch("/actions/on-demand-read", { method: "POST" });
    revalidatePath("/dashboard");
  }

  async function runOnDemandWrite() {
    "use server";
    await ebFetch("/actions/on-demand-write", { method: "POST" });
    revalidatePath("/dashboard");
  }

  return (
    <main className="p-6 space-y-6">
      <h1 className="text-2xl font-semibold">Store Dashboard</h1>

      <div className="grid gap-4 md:grid-cols-2">
        {/* On-Demand Read */}
        <form action={runOnDemandRead}>
          <ActionButton>Run On-Demand Read</ActionButton>
        </form>

        {/* On-Demand Write */}
        <form action={runOnDemandWrite}>
          <ActionButton>Run On-Demand Write</ActionButton>
        </form>
      </div>

      <pre className="text-sm bg-neutral-100 p-3 rounded">
        {JSON.stringify(status, null, 2)}
      </pre>

      {/* Logout */}
      <form
        action={async () => {
          "use server";
          await fetch("/api/auth/logout", { method: "POST" });
          redirect("/sign-in");
        }}
      >
        <button className="rounded border py-2 px-3">Sign out</button>
      </form>
    </main>
  );
}


