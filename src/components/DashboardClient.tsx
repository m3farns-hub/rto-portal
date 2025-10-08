"use client";

import { useEffect } from "react";
import ActionButton from "./ActionButton";

export default function DashboardClient() {
  useEffect(() => {
    console.log("[DashboardClient] mounted");
    const el = document.getElementById("hydrate-check");
    if (el) el.textContent = "✅ Hydrated: client JS is running!";
  }, []);

  return (
    <div className="grid gap-4 md:grid-cols-2 mt-4">
      <ActionButton endpoint="/api/actions/on-demand-read" label="Run On-Demand Read" />
      <ActionButton endpoint="/api/actions/on-demand-write" label="Run On-Demand Write" />
    </div>
  );
}
