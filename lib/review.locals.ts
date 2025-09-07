import { z } from 'zod';

/** Zod schema para validar una reseña (createdAt siempre string ISO) */
export const reviewSchema = z.object({
  id: z.string(),
  rating: z.number().int().min(1).max(5),
  content: z.string().trim().min(5),
  up: z.number().int().min(0),
  down: z.number().int().min(0),
  createdAt: z.string(), // ISO
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
    } catch {}
  },
  removeItem(key: string): void {
    try {
      if (isBrowser) window.localStorage.removeItem(key);
    } catch {}
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

function uuid(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return (crypto as Crypto).randomUUID();
  }
  return 'id-' + Math.random().toString(36).slice(2);
}

/** Normaliza cualquier objeto parecido a Review a nuestro shape fuerte */
function normalizeRow(r: any): Review {
  return {
    id: String(r?.id ?? r?._id ?? uuid()),
    rating: Number.isInteger(r?.rating) ? r.rating : 0,
    content: typeof r?.content === 'string' ? r.content : '',
    up: typeof r?.up === 'number' && r.up >= 0 ? r.up : 0,
    down: typeof r?.down === 'number' && r.down >= 0 ? r.down : 0,
    createdAt:
      typeof r?.createdAt === 'string'
        ? r.createdAt
        : new Date().toISOString(),
  };
}

function load(volumeId: string): Review[] {
  const arr = safeParse<any[]>(storage.getItem(KEY(volumeId)), []);
  return arr.map(normalizeRow);
}

function save(volumeId: string, rows: Review[]): void {
  storage.setItem(KEY(volumeId), JSON.stringify(rows));
}

function assertValidInput(rating: number, content: string) {
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    throw new Error('rating inválido (debe ser entero entre 1 y 5)');
  }
  const trimmed = content.trim();
  if (trimmed.length < 5) {
    throw new Error('contenido inválido (al menos 5 caracteres después de trim)');
  }
  // Límite opcional de palabras (100)
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
  // Ordenar desc por fecha
  rows.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
  save(volumeId, rows);

  return normalized;
}

export function getReviews(volumeId: string): Review[] {
  const rows = load(volumeId);
  // Aseguramos shape + orden (por si hay datos legacy sin up/down)
  const norm = rows.map(normalizeRow);
  norm.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
  return norm;
}

/**
 * delta: +1 para like, -1 para dislike
 */
export function voteReview(volumeId: string, id: string, delta: number): void {
  if (delta !== 1 && delta !== -1) return; // no-op

  // Cargar normalizado
  const rows = load(volumeId).map(normalizeRow);

  // Admitimos id o _id por compatibilidad
  const idx = rows.findIndex((r: any) => r.id === id || r._id === id);
  if (idx === -1) return;

  const r = rows[idx];
  const up = Number.isFinite(r.up) ? r.up : 0;
  const down = Number.isFinite(r.down) ? r.down : 0;

  const updated: Review =
    delta === 1
      ? { ...r, up: up + 1 }
      : { ...r, down: down + 1 };

  rows[idx] = updated;
  save(volumeId, rows);
}
