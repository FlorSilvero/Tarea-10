import { NextResponse } from 'next/server';
import Review from '@/models/Review';
import Vote from '@/models/Vote';
import { connectToDB } from '@/lib/db';

export async function PATCH(request: Request) {
  const { reviewId, delta } = await request.json();
  if (!reviewId || ![1, -1].includes(delta)) {
    return NextResponse.json({ error: 'Missing or invalid fields' }, { status: 400 });
  }
  // Obtener usuario actual
  const { requireUser } = await import('@/lib/auth');
  const me = await requireUser({
    ...request,
    headers: {
      get: (key: string) => request.headers.get(key) ?? undefined
    }
  });
  await connectToDB();
  const review = await Review.findById(reviewId);
  if (!review) {
    return NextResponse.json({ error: 'Review not found' }, { status: 404 });
  }
  // Usar colección Vote para registrar el voto único por usuario y review
  const userId = me.id;
  const reviewObjId = review._id;
  // Busca si ya existe un voto
  const existingVote = await Vote.findOne({ reviewId: reviewObjId, userId });
  let upCount = review.upCount ?? 0;
  let downCount = review.downCount ?? 0;
  if (existingVote) {
    if (existingVote.type === delta) {
      // Si el voto es igual, lo quitamos (toggle)
      await existingVote.deleteOne();
      if (delta === 1) upCount = Math.max(0, upCount - 1);
      else downCount = Math.max(0, downCount - 1);
    } else {
      // Cambia de like a dislike o viceversa
      if (existingVote.type === 1) {
        upCount = Math.max(0, upCount - 1);
        downCount = downCount + 1;
      } else {
        downCount = Math.max(0, downCount - 1);
        upCount = upCount + 1;
      }
      existingVote.type = delta;
      await existingVote.save();
    }
  } else {
    // Nuevo voto
    await Vote.create({ reviewId: reviewObjId, userId, type: delta });
    if (delta === 1) upCount = upCount + 1;
    else downCount = downCount + 1;
  }
  // Actualiza los contadores en Review
  review.upCount = upCount;
  review.downCount = downCount;
  await review.save();
  return NextResponse.json({
    _id: review._id,
    volumeId: review.volumeId,
    userId: review.userId,
    userName: review.userName,
    userEmail: review.userEmail,
    rating: review.rating,
    text: review.content,
    createdAt: review.createdAt,
    up: review.upCount ?? 0,
    down: review.downCount ?? 0
  });
}
