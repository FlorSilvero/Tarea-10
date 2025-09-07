// components/ReviewForm.tsx
'use client';

import React, { useState } from 'react';
import { z } from 'zod';

const FormSchema = z.object({
  rating: z.coerce.number().min(1).max(5),
  content: z.string().min(5).max(2000),
});

export default function ReviewForm({ volumeId }: { volumeId: string }) {
  const [error, setError] = useState<string>();
  const [ok, setOk] = useState(false);
  const [sending, setSending] = useState(false);

  return (
    <form
      data-testid="review-form"
      onSubmit={async (e) => {
        e.preventDefault();
        if (sending) return;

        const formEl = e.currentTarget as HTMLFormElement;
        const fd = new FormData(formEl);
        const raw = {
          rating: fd.get('rating'),
          content: fd.get('content'),
        };

        const parsed = FormSchema.safeParse(raw);
        if (!parsed.success) {
          setOk(false);
          setError('Seleccioná un puntaje y escribí al menos 5 caracteres.');
          return;
        }

        try {
          setSending(true);
          setError(undefined);

          // Enviar la reseña a la API real
          const res = await fetch('/api/reviews', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              volumeId,
              rating: parsed.data.rating,
              content: String(raw.content),
            }),
          });

          if (!res.ok) throw new Error('Error al publicar reseña');

          formEl.reset();
          setOk(true);
          window.dispatchEvent(new CustomEvent('reviews-changed', { detail: { volumeId } }));
        } catch (err) {
          setOk(false);
          setError('Ocurrió un error al publicar. Intentá de nuevo.');
        } finally {
          setSending(false);
        }
      }}
      className="rounded-2xl border border-violet-100 bg-white/80 p-4 shadow-sm backdrop-blur-sm space-y-3"
    >
      <div className="flex gap-3">
        <select
          name="rating"
          className="rounded-xl border border-violet-200 bg-white px-3 py-2 text-sm focus:border-violet-400 focus:outline-none"
          aria-label="Puntaje"
          defaultValue=""
        >
          <option value="" disabled hidden>
            Seleccioná un puntaje
          </option>
          {[1, 2, 3, 4, 5].map((n) => (
            <option key={n} value={n}>
              {n} ★
            </option>
          ))}
        </select>

        <textarea
          name="content"
          rows={3}
          placeholder="Escribí tu reseña..."
          className="flex-1 rounded-xl border border-violet-200 bg-white px-3 py-2 text-sm focus:border-violet-400 focus:outline-none"
        />
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}
      {ok && <p className="text-sm text-violet-700">¡Reseña publicada en este dispositivo!</p>}

      <button
        type="submit"
        disabled={sending}
        className="rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 px-4 py-2 text-white text-sm font-semibold hover:from-violet-700 hover:to-fuchsia-700 shadow-md active:scale-[.99] transition disabled:opacity-60 disabled:cursor-not-allowed"
      >
        Publicar reseña
      </button>
    </form>
  );
}
