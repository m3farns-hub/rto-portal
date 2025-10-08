import { redirect } from "next/navigation";
import { ebFetch } from "@/lib/eb";
import { getSessionToken } from "@/lib/cookies";
import ActionButton from "@/components/ActionButton";

export default async function Dashboard() {
  const token = await getSessionToken();
  if (!token) redirect("/sign-in");

  const status = await ebFetch("/status")
    .then((r) => r.json())
    .catch(() => ({ ok: false }));

  return (
    <main className="p-6 space-y-6">
      <h1 className="text-2xl font-semibold">Store Dashboard</h1>

      <div className="grid gap-4 md:grid-cols-2">
        <ActionButton endpoint="/api/actions/on-demand-read" label="Run On-Demand Read" />
        <ActionButton endpoint="/api/actions/on-demand-write" label="Run On-Demand Write" />
      </div>

      <section>
        <h2 className="font-medium mb-2">API Status</h2>
        <pre className="text-sm bg-neutral-100 p-3 rounded">
          {JSON.stringify(status, null, 2)}
        </pre>
      </section>

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


