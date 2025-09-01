import Image from 'next/image';
import type { Volume } from '@/lib/googleBooks';
import { bestImage } from '@/lib/googleBooks';

export default function BookCard({ v }: { v: Volume }) {
  const info = v.volumeInfo;
  const img = bestImage(info);

  return (
    <a
      href={`/book/${v.id}`}
      className="group block rounded-2xl border border-violet-100 bg-white/70 p-4 shadow-sm backdrop-blur-sm
                 hover:shadow-[0_16px_40px_-16px_rgba(139,77,255,.35)] hover:-translate-y-0.5 transition"
    >
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
