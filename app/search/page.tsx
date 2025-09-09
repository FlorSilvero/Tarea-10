'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import BookCard from '@/components/BookCard';
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
          <BookCard v={b} />
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
