import { NextResponse } from 'next/server';
import Review from '@/models/Review';
import { connectToDB } from '@/lib/db';


export async function PATCH(request: Request) {
  const { reviewId, delta } = await request.json();
  if (!reviewId || ![1, -1].includes(delta)) {
    return NextResponse.json({ error: 'Missing or invalid fields' }, { status: 400 });
  }
  await connectToDB();
  const review = await Review.findById(reviewId);
  if (!review) {
    return NextResponse.json({ error: 'Review not found' }, { status: 404 });
  }
  // Aplica el voto
  if (delta === 1) {
    review.up = (review.up ?? 0) + 1;
  } else {
    review.down = (review.down ?? 0) + 1;
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
