"use client";

import { useEffect, useState } from "react";

type Props = {
  endpoint: "/api/actions/on-demand-read" | "/api/actions/on-demand-write";
  label: string;
};

export default function ActionButton({ endpoint, label }: Props) {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<string>("");

  // DEBUG: confirm hydration
  useEffect(() => {
    console.log(`[ActionButton] mounted for ${label}`);
    const el = document.getElementById(`${label.replace(/\s+/g, "-")}-status`);
    if (el) el.textContent = "🧩 Client component mounted";
  }, [label]);

  async function handleClick() {
    console.log(`[ActionButton] clicked ${label}`);
    setLoading(true);
    setStatus("⏳ Running...");
    try {
      const res = await fetch(endpoint, { method: "POST" });
      const data = await res.json().catch(() => ({}));
      console.log(`[ActionButton] response`, res.status, data);
      if (res.ok && data?.ok) setStatus("✅ Success!");
      else setStatus(`❌ Failed (${res.status})`);
    } catch (err: any) {
      console.error(`[ActionButton] error`, err);
      setStatus(`❌ Error: ${String(err?.message ?? err)}`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-2 border p-3 rounded">
      <button
        type="button"
        onClick={handleClick}
        disabled={loading}
        className="w-full rounded bg-black text-white py-3 disabled:opacity-50"
      >
        {loading ? "Running..." : label}
      </button>
      <div id={`${label.replace(/\s+/g, "-")}-status`} className="text-sm text-gray-600">
        {status}
      </div>
    </div>
  );
}

