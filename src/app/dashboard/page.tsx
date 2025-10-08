// src/app/dashboard/page.tsx
import { redirect } from "next/navigation";
import { ebFetch } from "@/lib/eb";
import { getSessionToken } from "@/lib/cookies";

export default async function Dashboard() {
  // Make sure user is signed in
  const token = await getSessionToken();
  if (!token) redirect("/sign-in");

  // Load API status
  const status = await ebFetch("/status")
    .then((res) => res.json())
    .catch(() => ({ ok: false }));

  return (
    <main className="p-6 space-y-6">
      <h1 className="text-2xl font-semibold">Store Dashboard</h1>

      <div className="grid gap-4 md:grid-cols-2">
        {/* --- On-Demand Read --- */}
        <form
          action={async () => {
            "use server";
            await ebFetch("/actions/on-demand-read", { method: "POST" });
          }}
        >
          <button className="w-full rounded bg-black text-white py-3">
            Run On-Demand Read
          </button>
        </form>

        {/* --- On-Demand Write --- */}
        <form
          action={async () => {
            "use server";
            await ebFetch("/actions/on-demand-write", { method: "POST" });
          }}
        >
          <button className="w-full rounded bg-black text-white py-3">
            Run On-Demand Write
          </button>
        </form>
      </div>

      {/* --- Show API Status --- */}
      <pre className="text-sm bg-neutral-100 p-3 rounded">
        {JSON.stringify(status, null, 2)}
      </pre>

      {/* --- Logout --- */}
      <form
        action={async () => {
          "use server";
          await fetch("/api/auth/logout", { method: "POST" });
        }}
      >
        <button className="rounded border py-2 px-3">Sign out</button>
      </form>
    </main>
  );
}

