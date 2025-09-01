// components/ReviewList.tsx
'use client';

import { useEffect, useState } from 'react';
import { getReviews, type Review } from '../lib/review.locals';

export default function ReviewList({ volumeId }: { volumeId: string }) {
  const [rows, setRows] = useState<Review[]>([]);

  useEffect(() => {
    setRows(getReviews(volumeId));
  }, [volumeId]);

  useEffect(() => {
    const onChanged = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (!detail || detail.volumeId !== volumeId) return;
      setRows(getReviews(volumeId));
    };
    window.addEventListener('reviews-changed', onChanged as EventListener);
    return () => window.removeEventListener('reviews-changed', onChanged as EventListener);
  }, [volumeId]);

  if (!rows.length) return <p className="text-sm text-gray-500">Sé la primera en reseñar ✨</p>;

  return (
    <ul className="space-y-3">
      {rows.map((r) => (
        <li key={r.id} className="rounded-xl border p-3">
          <div className="text-xs text-gray-500">
            {new Date(r.createdAt).toLocaleString()}
          </div>
          <div className="font-medium">Puntaje: {r.rating}★</div>
          <p>{r.content}</p>
        </li>
      ))}
    </ul>
  );
}
