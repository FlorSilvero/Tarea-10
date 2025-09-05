export async function GET(req: Request) {
  try {
    await connectToDB();
    const { searchParams } = new URL(req.url);
    const volumeId = searchParams.get('volumeId');
    if (!volumeId) {
      return NextResponse.json([], { status: 200 });
    }
    const reviews = await Review.find({ volumeId }).sort({ createdAt: -1 });
    // Opcional: mapear para mostrar solo los campos necesarios
    const result = reviews.map(r => ({
      _id: r._id,
      volumeId: r.volumeId,
      userId: r.userId,
      userName: r.userName,
      rating: r.rating,
      text: r.content,
      createdAt: r.createdAt,
    }));
    return NextResponse.json(result, { status: 200 });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? 'Error' }, { status: 500 });
  }
}
// src/app/api/reviews/route.ts  (POST)
import { NextResponse } from "next/server";
import { connectToDB } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import Review from "@/models/Review";
import { Types } from "mongoose";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const me = await requireUser(); // requiere estar logueado
    await connectToDB();

    const { volumeId, rating, content } = await req.json();
    if (!volumeId || typeof rating !== "number" || !content) {
      return NextResponse.json({ error: "Campos inválidos" }, { status: 400 });
    }

    if (!Types.ObjectId.isValid(me.id)) {
      return NextResponse.json({ error: "Usuario inválido" }, { status: 400 });
    }
    const userId = new Types.ObjectId(me.id);

    const doc = await Review.create({
      userId,
      volumeId,
      rating,
      content: String(content).trim(),
      up: 0,
      down: 0,
    });

    return NextResponse.json({ ok: true, review: doc }, { status: 201 });
  } catch (e: any) {
    if (e?.code === 11000) {
      return NextResponse.json({ error: "Ya publicaste una reseña para este libro" }, { status: 409 });
    }
    const status = e?.status ?? 500;
    return NextResponse.json({ error: e?.message ?? "Error" }, { status });
  }
}
