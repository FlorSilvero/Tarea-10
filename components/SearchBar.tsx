'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { FormEvent, useState } from 'react';

export default function SearchBar({ placeholder = 'Título, autor o ISBN', onSearch }: { placeholder?: string; onSearch?: (q: string) => void }) {
  const router = useRouter();
  const params = useSearchParams();
  const [q, setQ] = useState(() => params.get('q') ?? '');

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    const query = q.trim();
    if (onSearch) {
      onSearch(query);
    } else {
      router.push(query ? `/search?q=${encodeURIComponent(query)}` : '/search');
    }
  }

  return (
    <form onSubmit={onSubmit} className="flex items-center gap-2">
      <div className="relative flex-1 group">
        {/* ícono lupa */}
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-violet-600 transition-colors">
          <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden>
            <path fill="currentColor" d="M15.5 14h-.8l-.3-.3a6.5 6.5 0 1 0-1.4 1.4l.3.3v.8L20 21.5 21.5 20 15.5 14zM6.5 11a4.5 4.5 0 1 1 9 0a4.5 4.5 0 0 1-9 0" />
          </svg>
        </span>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={placeholder}
          className="w-full rounded-xl border border-violet-200 bg-[#f7f3ff] pl-10 pr-24 py-3 shadow-sm outline-none ring-0 transition
                     focus:border-violet-400 focus:bg-white focus:shadow-[0_10px_30px_-10px_rgba(139,77,255,.25)] text-gray-900"
        />
        {/* tecla ⌘K a la derecha del input */}
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[12px] text-gray-500 select-none">
          ⌘K
        </span>
      </div>

      <button
        type="submit"
        className="rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white px-5 py-3 text-sm font-semibold
                   shadow-md hover:shadow-lg hover:from-violet-700 hover:to-fuchsia-700 active:scale-[.99] transition"
      >
        Buscar
      </button>
    </form>
  );
}
