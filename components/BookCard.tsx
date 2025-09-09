"use client";
import React from 'react';
import Image from 'next/image';
import type { Volume } from '@/lib/googleBooks';
import { bestImage } from '@/lib/googleBooks';

export default function BookCard({ v }: { v: Volume }) {
  const info = v.volumeInfo;
  const img = bestImage(info);
  const [fav, setFav] = React.useState(false);
  React.useEffect(() => {
    // Verifica si el libro está en favoritos del usuario
    async function fetchFav() {
      try {
        const res = await fetch('/api/me');
        if (res.ok) {
          const data = await res.json();
          setFav(Array.isArray(data.favorites) && data.favorites.includes(v.id));
        }
      } catch {}
    }
    fetchFav();
  }, [v.id]);

  async function toggleFav(e: React.MouseEvent) {
    e.preventDefault();
    try {
      const method = fav ? 'DELETE' : 'POST';
      const res = await fetch('/api/favorite', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ volumeId: v.id })
      });
      if (res.ok) setFav(!fav);
    } catch {}
  }

  return (
    <a
      href={`/book/${v.id}`}
      className="group block rounded-2xl border border-violet-100 bg-white/70 p-4 shadow-sm backdrop-blur-sm
                 hover:shadow-[0_16px_40px_-16px_rgba(139,77,255,.35)] hover:-translate-y-0.5 transition relative"
    >
      <button
        onClick={toggleFav}
        className="absolute top-2 right-2 z-10 text-pink-500 hover:text-pink-600 bg-white/80 rounded-full p-1 shadow"
        aria-label={fav ? 'Quitar de favoritos' : 'Agregar a favoritos'}
      >
        {fav ? (
          <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24" width="24" height="24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41 0.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" width="24" height="24"><path d="M12.1 8.64l-.1.1-.1-.1C10.14 6.6 7.1 6.24 5.1 8.24c-2 2-2 5.26 0 7.26l7 7 7-7c2-2 2-5.26 0-7.26-2-2-5.14-1.64-7.1.4z"/></svg>
        )}
      </button>
      <div className="flex gap-4">
        <div className="relative h-28 w-20 shrink-0 overflow-hidden rounded-lg bg-[#ede6ff] ring-1 ring-violet-100">
          {img ? (
            <Image src={img} alt={info.title ?? ''} fill sizes="80px" className="object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-xs text-violet-700/70">Sin portada</div>
          )}
        </div>

        <div className="min-w-0">
          <h3 className="font-semibold leading-tight text-gray-900 group-hover:underline">
            {info.title ?? 'Sin título'}
          </h3>
          <p className="mt-0.5 text-sm text-gray-600 line-clamp-1">
            {info.authors?.join(', ') ?? 'Autor desconocido'}
          </p>
          {info.categories?.length ? (
            <p className="mt-1 text-xs text-gray-500 line-clamp-1">{info.categories.join(' • ')}</p>
          ) : null}
        </div>
      </div>
    </a>
  );
}
