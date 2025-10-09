"use client";

import { useFormStatus } from "react-dom";

type Props = {
  children: React.ReactNode;
  className?: string;
};

export function ActionButton({ children, className }: Props) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className={
        className ??
        "w-full rounded bg-black text-white py-3 disabled:opacity-60 disabled:cursor-not-allowed"
      }
    >
      {pending ? "Running..." : children}
    </button>
  );
}

