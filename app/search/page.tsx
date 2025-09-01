'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Image from 'next/image';
import SearchBar from '@/components/SearchBar';

type Book = {
  id: string;
  volumeInfo: {
    title?: string;
    authors?: string[];
    publishedDate?: string;
    description?: string;
    imageLinks?: { thumbnail?: string };
  };
};

function BookResults() {
  const params = useSearchParams();
  const q = params.get('q');
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!q) {
      setBooks([]);
      return;
    }
    setLoading(true);
    fetch(`/api/books?q=${encodeURIComponent(q)}`)
      .then((res) => res.json())
      .then((data) => {
        setBooks((data.items as Book[]) || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [q]);

  if (!q) return null;
  if (loading) return <div className="mt-8 text-center text-gray-600 animate-pulse">Buscando libros...</div>;
  if (!books.length) return <div className="mt-8 text-center text-gray-900">No se encontraron resultados.</div>;

  return (
    <ul className="mt-8 grid gap-6 sm:grid-cols-2 md:grid-cols-3">
      {books.map((b) => (
        <li key={b.id}>
          <a
            href={`/book/${b.id}`}
            className="group block rounded-2xl border border-violet-100 bg-white/70 p-4 shadow-sm backdrop-blur-sm
                       hover:shadow-[0_16px_40px_-16px_rgba(139,77,255,.35)] hover:-translate-y-0.5 transition"
          >
            <div className="flex gap-4">
              {b.volumeInfo.imageLinks?.thumbnail ? (
                <Image
                  src={b.volumeInfo.imageLinks.thumbnail}
                  alt={b.volumeInfo.title ?? 'Portada'}
                  width={80}
                  height={112}
                  className="w-20 h-28 object-cover rounded-xl border border-violet-100 shadow-sm"
                />
              ) : (
                <div className="w-20 h-28 rounded-xl border border-violet-100 bg-[#ede6ff] grid place-items-center text-xs text-violet-700/70">
                  Sin portada
                </div>
              )}
              <div className="flex-1 min-w-0">
                <h3 className="text-gray-900 text-lg mb-1 font-semibold group-hover:underline line-clamp-2">
                  {b.volumeInfo.title}
                </h3>
                <p className="text-gray-600 text-sm mb-1 line-clamp-1">{b.volumeInfo.authors?.join(', ')}</p>
                <p className="text-gray-500 text-xs">{b.volumeInfo.publishedDate}</p>
                {b.volumeInfo.description && (
                  <p className="mt-2 text-gray-700 text-sm line-clamp-3">{b.volumeInfo.description}</p>
                )}
              </div>
            </div>
          </a>
        </li>
      ))}
    </ul>
  );
}

export default function SearchPage() {
  return (
    <section className="max-w-5xl mx-auto py-10 px-4 rounded-3xl bg-white/60 border border-violet-100 shadow-[0_20px_80px_-20px_rgba(139,77,255,.25)] backdrop-blur-xl">
      <h1 className="font-display text-3xl md:text-4xl font-semibold tracking-tight mb-4 text-gray-900">
        Descubrí, calificá y compartí libros
      </h1>

      {/* ⬇️ Importante: Suspense alrededor de SearchBar */}
      <Suspense fallback={null}>
        <SearchBar />
      </Suspense>

      <p className="mt-2 text-xs text-violet-700">
        Ejemplos: <em>harry potter</em> · <em>inauthor:rowling</em> · <em>isbn:9780439708180</em>
      </p>

      <Suspense fallback={<div className="mt-8 text-center text-gray-600 animate-pulse">Cargando…</div>}>
        <BookResults />
      </Suspense>
    </section>
  );
}
