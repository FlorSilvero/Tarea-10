'use client';

import { useEffect, useState } from 'react';

export type Review = {
  _id?: string;
  volumeId?: string;
  userId?: string;
  userEmail?: string;
  rating: number;
  text: string;
  createdAt?: string;
  up: number;
  down: number;
};

export default function ReviewList({ volumeId }: { volumeId: string }) {
  const [rows, setRows] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [usuarioActual, setUsuarioActual] = useState<{ email: string } | null>(null);
  const [editId, setEditId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const [editRating, setEditRating] = useState<number>(1);

  // Obtiene el usuario autenticado desde la API
  useEffect(() => {
    async function fetchUser() {
      try {
        const res = await fetch('/api/me');
        if (res.ok) {
          const data = await res.json();
          setUsuarioActual({ email: data.email });
        }
      } catch {}
    }
    fetchUser();
  }, []);

  async function fetchReviews() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/reviews?volumeId=${encodeURIComponent(volumeId)}`);
      if (!res.ok) throw new Error('No se pudieron obtener las reseñas');
      const data = await res.json();

      // Normaliza ambas formas posibles: con votes[] o con up/down, text/content, etc.
      const normalized: Review[] = Array.isArray(data)
        ? data.map((d: any) => {
            const likes = Array.isArray(d?.votes)
              ? d.votes.filter((v: any) => v?.type === 'like').length
              : d?.up ?? 0;
            const dislikes = Array.isArray(d?.votes)
              ? d.votes.filter((v: any) => v?.type === 'dislike').length
              : d?.down ?? 0;

            return {
              _id: d._id ?? d.id ?? String(Math.random()),
              volumeId: d.volumeId,
              userId: d.userId,
              userEmail: d.user?.email ?? d.userEmail ?? '',
              rating: d.rating ?? d.score ?? 0,
              text: d.text ?? d.content ?? '',
              createdAt: d.createdAt,
              up: likes ?? 0,
              down: dislikes ?? 0,
            };
          })
        : [];

      setRows(normalized);
    } catch (err: any) {
      setError(err?.message || 'Error al cargar reseñas');
      setRows([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchReviews();
    const onChanged = () => fetchReviews();
    window.addEventListener('reviews-changed', onChanged as EventListener);
    return () => window.removeEventListener('reviews-changed', onChanged as EventListener);
  }, [volumeId]);

  async function handleDelete(reviewId: string) {
    await fetch('/api/reviews', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: reviewId }),
    });
    await fetchReviews();
  }

  function handleEdit(reviewId: string, content: string, rating: number) {
    setEditId(reviewId);
    setEditContent(content);
    setEditRating(rating);
  }

  async function handleEditSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!editId) return;
    await fetch('/api/reviews', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: editId, content: editContent, rating: editRating }),
    });
    setEditId(null);
    setEditContent('');
    setEditRating(1);
    await fetchReviews();
  }

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
              <>
                <span aria-hidden>·</span>
                <span className="text-gray-500">{r.userEmail}</span>
              </>
            )}
          </div>
          <div className="font-medium">Puntaje: {r.rating}★</div>
          <p>{r.text}</p>
          <div className="text-xs text-gray-600 mt-1" aria-label="vote-counts">
            {r.up} like, {r.down} dislike
          </div>
          <div className="flex gap-2 items-center mt-2">
            <button
              aria-label="like"
              className="px-2 py-1 rounded bg-green-100 text-green-800 text-xs font-semibold hover:bg-green-200"
              onClick={async () => {
                await fetch('/api/reviews/vote', {
                  method: 'PATCH',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ volumeId, reviewId: r._id, delta: 1 }),
                });
                await fetchReviews();
              }}
            >
              Like
            </button>
            <button
              aria-label="dislike"
              className="px-2 py-1 rounded bg-red-100 text-red-800 text-xs font-semibold hover:bg-red-200"
              onClick={async () => {
                await fetch('/api/reviews/vote', {
                  method: 'PATCH',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ volumeId, reviewId: r._id, delta: -1 }),
                });
                await fetchReviews();
              }}
            >
              Dislike
            </button>
            {usuarioActual?.email && r.userEmail === usuarioActual.email && (
              <>
                {editId === r._id ? (
                  <form onSubmit={handleEditSubmit} className="flex gap-2 items-center">
                    <input
                      type="text"
                      value={editContent}
                      onChange={e => setEditContent(e.target.value)}
                      className="border rounded px-2 py-1 text-xs"
                      placeholder="Nuevo texto"
                      required
                    />
                    <select
                      value={editRating}
                      onChange={e => setEditRating(Number(e.target.value))}
                      className="border rounded px-2 py-1 text-xs"
                      required
                    >
                      {[1,2,3,4,5].map(n => (
                        <option key={n} value={n}>{n}★</option>
                      ))}
                    </select>
                    <button type="submit" className="px-2 py-1 rounded bg-blue-100 text-blue-800 text-xs font-semibold hover:bg-blue-200">Guardar</button>
                    <button type="button" className="px-2 py-1 rounded bg-gray-100 text-gray-800 text-xs font-semibold hover:bg-gray-200" onClick={() => setEditId(null)}>Cancelar</button>
                  </form>
                ) : (
                  <>
                    <button
                      className="px-2 py-1 rounded bg-yellow-100 text-yellow-800 text-xs font-semibold hover:bg-yellow-200"
                      onClick={() => handleEdit(r._id!, r.text, r.rating)}
                    >
                      Editar
                    </button>
                    <button
                      className="px-2 py-1 rounded bg-gray-100 text-gray-800 text-xs font-semibold hover:bg-gray-200"
                      onClick={() => handleDelete(r._id!)}
                    >
                      Eliminar
                    </button>
                  </>
                )}
              </>
            )}
          </div>
        </li>
      ))}
    </ul>
  );
}
