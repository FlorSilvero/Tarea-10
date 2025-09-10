import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";

export const runtime = "nodejs";

export async function GET(req: Request) {
  const s = await getSession({
    ...req,
    headers: {
      get: (key: string) => req.headers.get(key) ?? undefined
    }
  });
  if (!s) return NextResponse.json({ user: null }, { status: 401 });
  return NextResponse.json({ user: s });
}
