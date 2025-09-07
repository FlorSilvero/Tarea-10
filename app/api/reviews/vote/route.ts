import { NextResponse } from 'next/server';
import Review from '@/models/Review';
import { connectToDB } from '@/lib/db';

export async function PATCH(request: Request) {
  const { reviewId, delta } = await request.json();
  if (!reviewId || ![1, -1].includes(delta)) {
    return NextResponse.json({ error: 'Missing or invalid fields' }, { status: 400 });
  }
  // Obtener usuario actual
  const { requireUser } = await import('@/lib/auth');
  const me = await requireUser();
  await connectToDB();
  const review = await Review.findById(reviewId);
  if (!review) {
    return NextResponse.json({ error: 'Review not found' }, { status: 404 });
  }
  // Votos por usuario: guardamos en review.votes: [{ userId, value }]
  if (!Array.isArray(review.votes)) review.votes = [];
  // Busca si el usuario ya votó
interface Vote {
    userId: string;
    value: number;
}

interface User {
    id: string;
}

interface ReviewType {
    votes: Vote[];
    up?: number;
    down?: number;
    _id: string;
    volumeId: string;
    userId: string;
    userName: string;
    userEmail: string;
    rating: number;
    content: string;
    createdAt: Date;
    save: () => Promise<void>;
}

const idx: number = (review as ReviewType).votes.findIndex((v: Vote) => v.userId === (me as User).id);
  if (idx !== -1) {
    const prev = review.votes[idx].value;
    if (prev === delta) {
      // Si el voto es igual, lo quitamos (toggle)
      review.votes.splice(idx, 1);
      if (delta === 1) review.up = Math.max(0, (review.up ?? 0) - 1);
      else review.down = Math.max(0, (review.down ?? 0) - 1);
    } else {
      // Cambia de like a dislike o viceversa
      if (prev === 1) {
        review.up = Math.max(0, (review.up ?? 0) - 1);
        review.down = (review.down ?? 0) + 1;
      } else {
        review.down = Math.max(0, (review.down ?? 0) - 1);
        review.up = (review.up ?? 0) + 1;
      }
      review.votes[idx].value = delta;
    }
  } else {
    // Nuevo voto
    review.votes.push({ userId: me.id, value: delta });
    if (delta === 1) review.up = (review.up ?? 0) + 1;
    else review.down = (review.down ?? 0) + 1;
  }
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
    up: review.up ?? 0,
    down: review.down ?? 0
  });
}
