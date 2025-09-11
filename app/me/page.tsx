"use client";
import { useEffect, useState } from 'react';

export default function PerfilUsuario() {
  const [data, setData] = useState<{ name: string; email: string; reviews: any[]; favorites?: string[] } | null>(null);
  const [showFavs, setShowFavs] = useState(false);
  const [favBooks, setFavBooks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchPerfil() {
      setLoading(true);
      try {
        // Obtener datos de usuario y favoritos
        const resUser = await fetch('/api/me');
        if (resUser.status === 401) {
          localStorage.removeItem('auth:user');
          window.dispatchEvent(new Event('auth-changed'));
          setData(null);
          window.location.href = '/auth';
          return;
        }
        const userJson = await resUser.json();
        if (!resUser.ok) throw new Error(userJson.error || 'Error al cargar usuario');

        // Obtener reseñas del usuario
        const resReviews = await fetch('/api/reviews/me');
        const reviewsJson = await resReviews.json();
        if (!resReviews.ok) throw new Error(reviewsJson.error || 'Error al cargar reseñas');

        setData({
          name: userJson.name ?? '',
          email: userJson.email ?? '',
          favorites: userJson.favorites ?? [],
          reviews: reviewsJson.reviews ?? []
        });
      } catch (e: any) {
        setError(e?.message || 'Error al cargar perfil');
      } finally {
        setLoading(false);
      }
    }
    fetchPerfil();
  }, []);

  if (loading) return <p>Cargando perfil...</p>;
  if (error) return <p style={{ color: 'red' }}>{error}</p>;
  if (!data) return null;

  return (
    <div className="max-w-xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-2">Perfil de usuario</h2>
      <div className="mb-4">
        <div><b>Nombre:</b> {data.name || <span className="text-gray-400">(vacío)</span>}</div>
        <div><b>Correo:</b> {data.email || <span className="text-gray-400">(vacío)</span>}</div>
      </div>
      <button
        className="mb-4 px-3 py-1 rounded bg-pink-100 text-pink-800 font-semibold hover:bg-pink-200"
        onClick={async () => {
          if (!data?.favorites?.length) return setShowFavs(true);
          setShowFavs(true);
          // Buscar datos de los libros favoritos
          const books = await Promise.all(
            data.favorites.map(async (id: string) => {
              try {
                const res = await fetch(`https://www.googleapis.com/books/v1/volumes/${id}`);
                if (res.ok) return await res.json();
              } catch {}
              return null;
            })
          );
          setFavBooks(books.filter(Boolean));
        }}
      >Ver libros favoritos</button>
      {!showFavs ? (
        <>
          <h3 className="text-lg font-semibold mb-2">Reseñas escritas</h3>
          <ul className="space-y-3">
            {(!data.reviews || data.reviews.length === 0) && <li>No escribiste ninguna reseña.</li>}
            {(data.reviews || []).map(r => (
              <li key={r._id} className="border rounded p-3">
                <div className="text-xs text-gray-500 mb-1">Título: <b>{r.bookTitle ? r.bookTitle : (r.book ? r.book : r.volumeId)}</b></div>
                <div>Puntaje: {r.rating}★</div>
                <div>{r.text}</div>
                <div className="text-xs text-gray-400 mt-1">{r.createdAt ? new Date(r.createdAt).toLocaleString() : ''}</div>
              </li>
            ))}
          </ul>
        </>
      ) : (
        <>
          <h3 className="text-lg font-semibold mb-2">Libros favoritos</h3>
          <ul className="space-y-3">
            {favBooks.length === 0 && <li>No agregaste ningún libro como favorito.</li>}
            {favBooks.map(b => (
              <li key={b.id} className="border rounded p-3 flex gap-3 items-center">
                {b.volumeInfo?.imageLinks?.thumbnail && (
                  <img src={b.volumeInfo.imageLinks.thumbnail} alt={b.volumeInfo.title} className="h-16 w-12 object-cover rounded" />
                )}
                <div>
                  <div className="font-semibold">{b.volumeInfo?.title}</div>
                  <div className="text-xs text-gray-500">{b.volumeInfo?.authors?.join(', ')}</div>
                </div>
              </li>
            ))}
          </ul>
          <button className="mt-4 px-3 py-1 rounded bg-gray-100 text-gray-800 font-semibold hover:bg-gray-200" onClick={() => setShowFavs(false)}>Volver</button>
        </>
      )}
    </div>
  );
}
