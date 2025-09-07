
// PATCH: editar reseña
export async function PATCH(req: Request) {
  try {
    const me = await requireUser();
    await connectToDB();
    const { id, content, rating } = await req.json();
    if (!id || (!content && typeof rating !== "number")) {
      return NextResponse.json({ error: "Campos inválidos" }, { status: 400 });
    }
    const review = await Review.findById(id);
    if (!review) return NextResponse.json({ error: "No encontrada" }, { status: 404 });
    if (String(review.userId) !== String(me.id)) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    }
    if (content) review.content = String(content).trim();
    if (typeof rating === "number") review.rating = rating;
    await review.save();
    return NextResponse.json({ ok: true, review }, { status: 200 });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? "Error" }, { status: 500 });
  }
}

// DELETE: eliminar reseña
export async function DELETE(req: Request) {
  try {
    const me = await requireUser();
    await connectToDB();
    const { id } = await req.json();
    if (!id) return NextResponse.json({ error: "Falta id" }, { status: 400 });
    const review = await Review.findById(id);
    if (!review) return NextResponse.json({ error: "No encontrada" }, { status: 404 });
    if (String(review.userId) !== String(me.id)) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    }
    await review.deleteOne();
    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? "Error" }, { status: 500 });
  }
}
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
      userEmail: r.userEmail,
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
      userName: me.name || '',
      userEmail: me.email || '',
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
