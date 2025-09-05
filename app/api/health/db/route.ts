// src/app/api/health/db/route.ts
import { NextResponse } from "next/server";
import { connectToDB } from "@/lib/db";

export const runtime = "nodejs"; // IMPORTANTE: Mongoose necesita Node, no Edge

export async function GET() {
  try {
    const conn = await connectToDB();
    const state = conn.connection.readyState; // 1 = connected
    return NextResponse.json({ ok: true, state });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err?.message ?? "fail" }, { status: 500 });
  }
}
