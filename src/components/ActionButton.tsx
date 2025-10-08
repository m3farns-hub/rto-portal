"use client";

import { useState } from "react";

type Props = {
  endpoint: "/api/actions/on-demand-read" | "/api/actions/on-demand-write";
  label: string;
};

export default function ActionButton({ endpoint, label }: Props) {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<"success" | "error" | null>(null);
  const [message, setMessage] = useState("");

  async function handleClick() {
    setLoading(true);
    setStatus(null);
    setMessage("");
    try {
      const res = await fetch(endpoint, { method: "POST" });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data?.ok) {
        setStatus("success");
        setMessage("✅ Success! The action completed successfully.");
      } else {
        setStatus("error");
        setMessage(`❌ Request failed: ${data?.error || res.statusText}`);
      }
    } catch (err: any) {
      setStatus("error");
      setMessage(`❌ Error: ${String(err?.message ?? err)}`);
    } finally {
      setLoading(false);
      // Keep visible for 6 seconds
      setTimeout(() => {
        setStatus(null);
        setMessage("");
      }, 6000);
    }
  }

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={handleClick}
        disabled={loading}
        className="w-full rounded bg-black text-white py-3 disabled:opacity-50"
      >
        {loading ? "Running..." : label}
      </button>

      {/* Always show a message area */}
      <div className="min-h-[1.5rem] text-sm transition-opacity">
        {message && (
          <div
            className={`p-2 rounded ${
              status === "success"
                ? "bg-green-100 text-green-700"
                : "bg-red-100 text-red-700"
            }`}
          >
            {message}
          </div>
        )}
      </div>
    </div>
  );
}

