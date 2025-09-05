// src/app/api/reviews/[volumeId]/route.ts
import { NextResponse } from "next/server";
import { connectToDB } from "@/lib/db";
import Review from "@/models/Review";

export const runtime = "nodejs";

export async function GET(
  _req: Request,
  { params }: { params: { volumeId: string } }
) {
  await connectToDB();

  const url = new URL(_req.url);
  const page = Number(url.searchParams.get("page") ?? 1);
  const size = Number(url.searchParams.get("size") ?? 10);

  const [items, total] = await Promise.all([
    Review.find({ volumeId: params.volumeId })
      .sort({ createdAt: -1 })
      .skip((page - 1) * size)
      .limit(size)
      .lean(),
    Review.countDocuments({ volumeId: params.volumeId }),
  ]);

  return NextResponse.json({ items, total, page, size });
}
