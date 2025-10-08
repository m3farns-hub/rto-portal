"use client";

import { useState } from "react";

type Props = {
  endpoint: "/api/actions/on-demand-read" | "/api/actions/on-demand-write";
  label: string;
};

export default function ActionButton({ endpoint, label }: Props) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string>("");

  async function handleClick() {
    setLoading(true);
    setResult("");
    try {
      const res = await fetch(endpoint, { method: "POST" });
      const text = await res.text();
      setResult(text);
    } catch (e: any) {
      setResult(`Error: ${String(e?.message ?? e)}`);
    } finally {
      setLoading(false);
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
      {result && (
        <pre className="text-sm bg-neutral-100 p-3 rounded overflow-auto">
          {result}
        </pre>
      )}
    </div>
  );
}
