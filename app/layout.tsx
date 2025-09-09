// app/layout.tsx

import './globals.css';
import type { Metadata } from 'next';
import Link from 'next/link';
import { connectToDB } from '../lib/db';

// Intentar conectar a la base de datos apenas se monta el layout
connectToDB();

export const metadata: Metadata = {
  title: 'Mundos en palabras',
  description: 'Busca libros con Google Books, mira detalles y deja reseñas.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>
        <header className="border-b bg-white">
          <nav className="mx-auto max-w-6xl px-4 h-14 flex items-center justify-between">
            <div className="flex items-center gap-6">
              <Link href="/" className="font-semibold tracking-tight text-lg">
                Mundos en palabras
              </Link>
              <Link href="/search" className="text-sm underline">
                Buscar
              </Link>
            </div>
            <Link href="/me">
              <button className="px-4 py-2 rounded bg-violet-600 text-white font-semibold hover:bg-violet-700 transition">Mi perfil</button>
            </Link>
          </nav>
        </header>

        <main className="mx-auto max-w-6xl px-4 py-8">{children}</main>
      </body>
    </html>
  );
}
