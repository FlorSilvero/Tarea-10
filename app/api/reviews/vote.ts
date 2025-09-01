import { NextResponse } from 'next/server';
import { Review } from '@/lib/review.locals';

// In-memory stores
const votesStore: Record<string, number> = {};
const reviewsStore: Record<string, Review[]> = {};

export async function PATCH(request: Request) {
  const { volumeId, reviewId, delta } = await request.json() as {
    volumeId: string;
    reviewId: string;
    delta: number;
  };

  if (!volumeId || !reviewId || ![1, -1].includes(delta)) {
    return NextResponse.json({ error: 'Missing or invalid fields' }, { status: 400 });
  }

  const reviews = reviewsStore[volumeId] || [];
  const idx = reviews.findIndex((r) => r.id === reviewId);
  if (idx === -1) {
    return NextResponse.json({ error: 'Review not found' }, { status: 404 });
  }

  const voteKey = `${reviewId}`;
  const mark = votesStore[voteKey];

  if (mark === undefined) {
    if (delta === 1) reviews[idx].up += 1;
    else reviews[idx].down += 1;
    votesStore[voteKey] = delta;
  } else if (mark === delta) {
    if (delta === 1) reviews[idx].up = Math.max(0, reviews[idx].up - 1);
    else reviews[idx].down = Math.max(0, reviews[idx].down - 1);
    delete votesStore[voteKey];
  } else {
    if (delta === 1) {
      reviews[idx].up += 1;
      reviews[idx].down = Math.max(0, reviews[idx].down - 1);
    } else {
      reviews[idx].down += 1;
      reviews[idx].up = Math.max(0, reviews[idx].up - 1);
    }
    votesStore[voteKey] = delta;
  }

  return NextResponse.json(reviews[idx]);
}
