import { NextResponse } from "next/server";
import { ebFetch } from "@/lib/eb";

export async function POST() {
  try {
    const res = await ebFetch("/actions/on-demand-read", { method: "POST" });
    const data = await res.json();
    return NextResponse.json(data, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: String(err?.message ?? err) }, { status: 500 });
  }
}
