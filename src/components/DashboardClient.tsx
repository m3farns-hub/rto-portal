"use client";

import ActionButton from "./ActionButton";

export default function DashboardClient() {
  console.log("[DashboardClient] mounted");
  return (
    <div className="grid gap-4 md:grid-cols-2 mt-4">
      <ActionButton endpoint="/api/actions/on-demand-read" label="Run On-Demand Read" />
      <ActionButton endpoint="/api/actions/on-demand-write" label="Run On-Demand Write" />
    </div>
  );
}
