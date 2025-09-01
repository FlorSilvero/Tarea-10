'use client';

import { Suspense, useEffect, useState } from 'react';
import SearchBar from '@/components/SearchBar';

// Frases rotativas inspiradoras
const phrases = [
  '“Un libro es un sueño que sostienes en tus manos.”',
  '“Leemos para saber que no estamos solos.”',
  '“Cada página es una puerta a otro mundo.”',
  '“Los libros nos encuentran cuando estamos listos para ellos.”',
];

export default function HomePage() {
  // Rotador simple de frases
  const [idx, setIdx] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setIdx((i) => (i + 1) % phrases.length), 4500);
    return () => clearInterval(id);
  }, []);

  return (
    <section className="relative mx-auto max-w-6xl px-4 py-16">
      {/* fondo con gradientes suaves */}
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-24 -left-24 h-80 w-80 rounded-full bg-violet-200/40 blur-3xl" />
        <div className="absolute -bottom-20 -right-16 h-96 w-96 rounded-full bg-fuchsia-200/40 blur-3xl" />
      </div>

      {/* tarjeta principal (glass) */}
      <div className="flex flex-col items-center justify-center gap-6 rounded-3xl border border-white/50 bg-white/70 p-10 shadow-[0_20px_80px_-20px_rgba(139,77,255,.25)] backdrop-blur-2xl">
        <h1 className="font-display text-3xl md:text-4xl font-semibold text-gray-900 text-center tracking-tight">
          Descubrí, calificá y compartí libros
        </h1>
        <p className="text-sm text-gray-600 text-center">
          Buscá por título, autor o ISBN.
        </p>

        <div className="w-full flex flex-col items-center">
          <div className="max-w-2xl w-full">
            {/* ⬇️ Importante: Suspense alrededor de SearchBar */}
            <Suspense fallback={null}>
              <SearchBar placeholder="Ej: harry potter, inauthor:rowling, isbn:9780439708180" />
            </Suspense>
          </div>
        </div>

        <p className="text-xs text-violet-600 text-center">
          Tip: probá <em>harry potter</em>, <em>inauthor:rowling</em> o <em>isbn:9780439708180</em>.
        </p>

        {/* Frase literaria rotativa */}
        <div className="mt-2 h-6 text-center text-sm text-gray-700 transition-opacity duration-500 ease-out">
          {phrases[idx]}
        </div>
      </div>
    </section>
  );
}
