// lib/review.locals.ts

import { z } from 'zod';

/** Zod schema para validar una reseña (createdAt siempre string ISO) */
export const reviewSchema = z.object({
  id: z.string(),
  rating: z.number().int().min(1).max(5),
  content: z.string().trim().min(5),
  up: z.number().int().min(0),
  down: z.number().int().min(0),
  createdAt: z.string(), // ← unificado a string
});

export type Review = {
  id: string;
  rating: number;    // 1..5, entero
  content: string;   // >=5 chars (trim)
  up: number;        // >=0
  down: number;      // >=0
  createdAt: string; // ISO string
};

const KEY = (volumeId: string) => `reviews:${volumeId}`;

// ---------- Shim de storage para SSR ----------
const isBrowser =
  typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';

const storage = {
  getItem(key: string): string | null {
    try {
      return isBrowser ? window.localStorage.getItem(key) : null;
    } catch {
      return null;
    }
  },
  setItem(key: string, val: string): void {
    try {
      if (isBrowser) window.localStorage.setItem(key, val);
    } catch {
      /* no-op */
    }
  },
  removeItem(key: string): void {
    try {
      if (isBrowser) window.localStorage.removeItem(key);
    } catch {
      /* no-op */
    }
  },
};

// ---------- Utilidades ----------
function safeParse<T>(raw: string | null, fallback: T): T {
  if (!raw) return fallback;
  try {
    const val = JSON.parse(raw);
    return Array.isArray(val) ? (val as T) : fallback;
  } catch {
    return fallback;
  }
}

function load(volumeId: string): Review[] {
  return safeParse<Review[]>(storage.getItem(KEY(volumeId)), []);
}

function save(volumeId: string, rows: Review[]): void {
  storage.setItem(KEY(volumeId), JSON.stringify(rows));
}

function uuid(): string {
  // Usa crypto.randomUUID si está disponible (browser moderno / node 19+)
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return (crypto as Crypto).randomUUID();
  }
  // Fallback simple
  return 'id-' + Math.random().toString(36).slice(2);
}

function assertValidInput(rating: number, content: string) {
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    throw new Error('rating inválido (debe ser entero entre 1 y 5)');
  }
  const trimmed = content.trim();
  if (trimmed.length < 5) {
    throw new Error('contenido inválido (al menos 5 caracteres después de trim)');
  }
  // Validación de límite máximo de palabras (ejemplo: 100 palabras)
  const maxWords = 100;
  const wordCount = trimmed.split(/\s+/).filter(Boolean).length;
  if (wordCount > maxWords) {
    throw new Error(`contenido inválido: superaste el límite de ${maxWords} palabras`);
  }
}

// ---------- API ----------
export function createReview(
  volumeId: string,
  input: { rating: number; content: string }
): Review {
  const rating = input.rating;
  const content = input.content?.toString() ?? '';

  assertValidInput(rating, content);

  const normalized: Review = {
    id: uuid(),
    rating,
    content: content.trim(),
    up: 0,
    down: 0,
    createdAt: new Date().toISOString(),
  };

  const rows = load(volumeId);
  rows.push(normalized);
  // Ordenar desc por fecha (más nuevo primero)
  rows.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  save(volumeId, rows);

  return normalized;
}

export function getReviews(volumeId: string): Review[] {
  const rows = load(volumeId);
  // Garantizar orden desc por fecha
  return [...rows].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export function voteReview(volumeId: string, id: string, delta: number): void {
  if (delta !== 1 && delta !== -1) return; // no-op para inválidos

  const rows = load(volumeId);
  const idx = rows.findIndex((r) => r.id === id);
  if (idx === -1) return;

  const r = rows[idx];
  if (delta === 1) {
    r.up = Math.max(0, (r.up ?? 0) + 1);
  } else {
    r.down = Math.max(0, (r.down ?? 0) + 1);
  }

  save(volumeId, rows);
}
