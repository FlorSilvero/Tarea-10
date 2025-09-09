// app/api/reviews/me/route.ts
import { NextResponse } from 'next/server';
import { requireUser } from '@/lib/auth';
import { connectToDB } from '@/lib/db';
import Review from '@/models/Review';
import mongoose from 'mongoose';

export async function GET() {
  try {
    const user = await requireUser();
    await connectToDB();

    // Construimos candidatos para $or (string id, ObjectId, email)
    const candidates: any[] = [];
    const rawId = String(user?.id ?? '').trim();

    if (rawId) {
      // match si userId se guardó como string
      candidates.push({ userId: rawId });
      // match si se guardó como ObjectId
      if (mongoose.Types.ObjectId.isValid(rawId)) {
        candidates.push({ userId: new mongoose.Types.ObjectId(rawId) });
      }
    }
    if (user?.email) candidates.push({ userEmail: user.email });

    if (candidates.length === 0) {
      return NextResponse.json({
        name: user.name ?? '',
        email: user.email ?? '',
        reviews: [],
        note: 'No se pudo determinar identificador de usuario para buscar reseñas.',
      });
    }

    const reviews = await Review.find({ $or: candidates })
      .sort({ createdAt: -1 })
      .lean();

    // Helper para obtener título (y cachearlo en memoria por request)
    const titleCache = new Map<string, string>();
    const getTitle = async (volumeId: string) => {
      if (titleCache.has(volumeId)) return titleCache.get(volumeId)!;
      try {
        const { getVolume } = await import('@/lib/googleBooks');
        const vol = await getVolume(volumeId);
        const t = vol?.volumeInfo?.title || volumeId;
        titleCache.set(volumeId, t);
        return t;
      } catch {
        return volumeId;
      }
    };

    // Enriquecer y, si falta, hacer backfill del bookTitle en DB
    const enriched = await Promise.all(
      reviews.map(async (r: any) => {
        let bookTitle = r.bookTitle ?? '';
        if (!bookTitle) {
          bookTitle = await getTitle(r.volumeId);
          // backfill sin bloquear la respuesta: “fire-and-forget”
          // si preferís esperar, podés hacer await aquí
          Review.updateOne({ _id: r._id }, { $set: { bookTitle } }).catch(() => {});
        }
        return {
          _id: String(r._id),
          volumeId: r.volumeId,
          rating: r.rating,
          text: r.content,
          createdAt: r.createdAt,
          book: bookTitle,
        };
      })
    );

    return NextResponse.json({
      name: user.name ?? '',
      email: user.email ?? '',
      reviews: enriched,
    });
  } catch (e: any) {
    console.error('[API /reviews/me] Error:', e);
    return NextResponse.json({ error: e?.message ?? 'Error' }, { status: 500 });
  }
}
