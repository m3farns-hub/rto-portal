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
        setMessage("Success! The action completed successfully.");
      } else {
        setStatus("error");
        setMessage(data?.error || "Request failed.");
      }
    } catch (err: any) {
      setStatus("error");
      setMessage(String(err?.message ?? err));
    } finally {
      setLoading(false);
      setTimeout(() => setStatus(null), 4000); // auto-hide after 4s
    }
  }

  return (
    <div className="space-y-2">
      <button
        onClick={handleClick}
        disabled={loading}
        className="w-full rounded bg-black text-white py-3 disabled:opacity-50"
      >
        {loading ? "Running..." : label}
      </button>

      {status && (
        <div
          className={`text-sm p-2 rounded transition-opacity duration-300 ${
            status === "success"
              ? "bg-green-100 text-green-700"
              : "bg-red-100 text-red-700"
          }`}
        >
          {message}
        </div>
      )}
    </div>
  );
}

