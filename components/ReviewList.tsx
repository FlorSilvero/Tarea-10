// components/ReviewList.tsx
'use client';

import { useEffect, useState } from 'react';
// import { getReviews, type Review } from '../lib/review.locals';

export type Review = {
  _id?: string;
  volumeId: string;
  userId: string;
  userName?: string;
  userEmail?: string;
  rating: number;
  text: string;
  createdAt?: string;
};

export default function ReviewList({ volumeId }: { volumeId: string }) {
  // Obtener el usuario actual desde localStorage
  const [currentUser, setCurrentUser] = useState<any>(null);
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const raw = localStorage.getItem('auth:user');
        setCurrentUser(raw ? JSON.parse(raw) : null);
      } catch {}
    }
    const onChange = () => {
      if (typeof window !== 'undefined') {
        try {
          const raw = localStorage.getItem('auth:user');
          setCurrentUser(raw ? JSON.parse(raw) : null);
        } catch {}
      }
    };
    window.addEventListener('auth-changed', onChange);
    return () => window.removeEventListener('auth-changed', onChange);
  }, []);
  const [rows, setRows] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function fetchReviews() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/reviews?volumeId=${encodeURIComponent(volumeId)}`);
      if (!res.ok) throw new Error('No se pudieron obtener las reseñas');
      const data = await res.json();
      setRows(Array.isArray(data) ? data : []);
    } catch (err: any) {
      setError(err?.message || 'Error al cargar reseñas');
      setRows([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchReviews();
    function onChanged() {
      fetchReviews();
    }
    window.addEventListener('reviews-changed', onChanged as EventListener);
    return () => window.removeEventListener('reviews-changed', onChanged as EventListener);
  }, [volumeId]);

  if (loading) return <p className="text-sm text-gray-400">Cargando reseñas...</p>;
  if (error) return <p className="text-sm text-red-500">{error}</p>;
  if (!rows.length) return <p className="text-sm text-gray-500">Sé la primera en reseñar ✨</p>;

  return (
    <ul className="space-y-3">
      {rows.map((r) => (
        <li key={r._id} className="rounded-xl border p-3">
          <div className="text-xs text-gray-500 flex gap-2 items-center">
            <span>{r.createdAt ? new Date(r.createdAt).toLocaleString() : ''}</span>
            {r.userEmail && (
              <span className="text-gray-500">· {r.userEmail}</span>
            )}
          </div>
          <div className="font-medium">Puntaje: {r.rating}★</div>
          <p>{r.text}</p>

          {/* Botones solo si es el autor */}
          {currentUser && r.userId === currentUser.id && (
            <div className="flex gap-2 mt-2">
              <button
                className="px-3 py-1 rounded bg-yellow-100 text-yellow-800 text-xs font-semibold hover:bg-yellow-200"
                onClick={async () => {
                  const nuevoTexto = prompt('Edita tu reseña:', r.text);
                  if (nuevoTexto && nuevoTexto !== r.text) {
                    const nuevoRating = prompt('Edita tu puntaje (1-5):', r.rating.toString());
                    const ratingNum = Number(nuevoRating);
                    if (ratingNum >= 1 && ratingNum <= 5) {
                      await fetch('/api/reviews', {
                        method: 'PATCH',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ id: r._id, content: nuevoTexto, rating: ratingNum }),
                      });
                      window.dispatchEvent(new CustomEvent('reviews-changed', { detail: { volumeId } }));
                    }
                  }
                }}
              >Editar</button>
              <button
                className="px-3 py-1 rounded bg-red-100 text-red-800 text-xs font-semibold hover:bg-red-200"
                onClick={async () => {
                  if (confirm('¿Seguro que querés eliminar tu reseña?')) {
                    await fetch('/api/reviews', {
                      method: 'DELETE',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ id: r._id }),
                    });
                    window.dispatchEvent(new CustomEvent('reviews-changed', { detail: { volumeId } }));
                  }
                }}
              >Eliminar</button>
            </div>
          )}
        </li>
      ))}
    </ul>
  );
}
