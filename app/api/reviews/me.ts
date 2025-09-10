// app/api/reviews/me/route.ts
import { NextResponse } from 'next/server';
import { requireUser } from '@/lib/auth';
import { connectToDB } from '@/lib/db';
import Review from '@/models/Review';
import mongoose from 'mongoose';

export async function GET(req: Request) {
  try {
    const user = await requireUser({
      ...req,
      headers: {
        get: (key: string) => req.headers.get(key) ?? undefined
      }
    });
    await connectToDB();

    const filters: Record<string, any> = {};

    // 1) Probar con user.id si luce como ObjectId
    if (user?.id && mongoose.Types.ObjectId.isValid(String(user.id))) {
      filters.userId = new mongoose.Types.ObjectId(String(user.id));
    }
    // 2) Último fallback: por email (solo si lo tenés guardado en las reseñas)
    else if (user?.email) {
      filters.userEmail = user.email;
    }

    // Si no pudimos construir un filtro razonable, devolvemos vacío
    if (Object.keys(filters).length === 0) {
      return NextResponse.json({
        name: user.name ?? '',
        email: user.email ?? '',
        reviews: [],
        note: 'No se pudo determinar un identificador de usuario válido para buscar reseñas.'
      });
    }

    const reviews = await Review.find(filters)
      .sort({ createdAt: -1 })
      .lean();

    // Obtener títulos faltantes en tiempo real si no existen
    const getTitle = async (volumeId: string) => {
      try {
        const { getVolume } = await import('@/lib/googleBooks');
        const vol = await getVolume(volumeId);
        return vol?.volumeInfo?.title ?? volumeId;
      } catch {
        return volumeId;
      }
    };

    const reviewsWithTitles = await Promise.all(
      reviews.map(async (r: any) => ({
        _id: String(r._id),
        volumeId: r.volumeId,
        rating: r.rating,
        text: r.content,
        createdAt: r.createdAt,
        book: r.bookTitle && r.bookTitle !== '' ? r.bookTitle : await getTitle(r.volumeId),
      }))
    );

    return NextResponse.json({
      name: user.name ?? '',
      email: user.email ?? '',
      reviews: reviewsWithTitles,
    });
  } catch (e: any) {
    console.error('[API /reviews/me] Error:', e);
    return NextResponse.json({ error: e?.message ?? 'Error' }, { status: 500 });
  }
}
