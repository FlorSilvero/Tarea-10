import Image from 'next/image';
import type { Metadata } from 'next';
import { getVolume, bestImage } from '@/lib/googleBooks';
import ReviewForm from '@/components/ReviewForm';
import ReviewList from '@/components/ReviewList';

type Params = { volumeId: string };

// (opcional pero recomendado para SEO)
export async function generateMetadata(
  { params }: { params: Promise<Params> }
): Promise<Metadata> {
  const { volumeId } = await params;
  // Si querés, podrías hacer un fetch mínimo para armar el title con el nombre
  // del libro. Para no duplicar requests, lo dejamos simple:
  return {
    title: `Libro ${volumeId} | Mi Librería`,
    description: `Detalles y reseñas del libro ${volumeId}`,
  };
}

export default async function Page(
  { params }: { params: Promise<Params> }
) {
  const { volumeId } = await params;

  const book = await getVolume(volumeId);
  const v = book.volumeInfo;
  const img = bestImage(v);
  const isbn = v.industryIdentifiers?.find((i) => i.type.includes('ISBN'))?.identifier;

  return (
    <article className="space-y-8 rounded-3xl border border-violet-100 bg-white/70 p-6 shadow-[0_20px_80px_-20px_rgba(139,77,255,.25)] backdrop-blur-sm">
      <div className="grid gap-8 md:grid-cols-[200px,1fr]">
        <div className="space-y-3">
          <div className="relative h-[280px] w-[200px] overflow-hidden rounded-xl border border-violet-100 bg-[#ede6ff]">
            {img ? (
              <Image
                src={img}
                alt={v.title ?? ''}
                fill
                sizes="200px"
                className="object-cover"
              />
            ) : null}
          </div>
          <div className="text-xs text-gray-500">
            {isbn ? <>ISBN: <span className="font-mono">{isbn}</span></> : null}
          </div>
        </div>

        <div className="space-y-4">
          <header>
            <h1 className="text-3xl font-bold leading-tight text-gray-900">{v.title}</h1>
            <p className="text-gray-600">{v.authors?.join(', ') ?? 'Autor desconocido'}</p>
            <p className="text-sm text-gray-500 mt-1">
              {v.publisher} {v.publisher && '·'} {v.publishedDate} {v.pageCount ? `· ${v.pageCount} págs` : ''}
            </p>
            {v.categories?.length ? (
              <div className="mt-2 flex flex-wrap gap-2">
                {v.categories.map((c) => (
                  <span
                    key={c}
                    className="rounded-full border border-violet-200 bg-[#f7f3ff] px-3 py-1 text-xs text-gray-700"
                  >
                    {c}
                  </span>
                ))}
              </div>
            ) : null}
          </header>

          {v.description ? (
            <section className="prose max-w-none">
              <h2 className="text-lg font-semibold text-gray-900">Descripción</h2>
              <p className="whitespace-pre-line text-gray-800">{v.description}</p>
            </section>
          ) : (
            <p className="text-gray-600">Este libro no tiene descripción disponible.</p>
          )}
        </div>
      </div>

      {/* Reseñas locales */}
      <section className="space-y-4">
        <ReviewForm volumeId={volumeId} />
        <ReviewList volumeId={volumeId} />
      </section>

      <div>
        <a
          href={`/search?q=${encodeURIComponent(v.title ?? '')}`}
          className="inline-flex items-center gap-2 rounded-xl border border-violet-200 px-4 py-2 text-gray-900 hover:bg-[#ede6ff] transition"
        >
          ← Volver a resultados
        </a>
      </div>
    </article>
  );
}
