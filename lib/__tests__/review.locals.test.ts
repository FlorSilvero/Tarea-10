import { describe, it, expect, beforeEach, vi } from 'vitest';
import { createReview, getReviews, voteReview } from '../review.locals';

describe('review.locals', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.useRealTimers();
  });

  // ----------------- [BÁSICO] -----------------
  describe('[BÁSICO]', () => {
  // Verifica que se puede crear una reseña y luego recuperarla correctamente
  it('crea y recupera una reseña', () => {
      createReview('book1', { rating: 5, content: 'Excelente libro' });
      const reviews = getReviews('book1');
      expect(reviews).toHaveLength(1);
      expect(reviews[0].rating).toBe(5);
      expect(reviews[0].content).toBe('Excelente libro');
      // createdAt es string ISO en la implementación robusta
      expect(typeof reviews[0].createdAt).toBe('string');
    });

  // Verifica que las reseñas se guardan separadas por volumeId y no se mezclan entre libros
  it('aísla por volumeId (no mezcla reseñas)', () => {
      createReview('book1', { rating: 5, content: 'Alpha ok' });
      createReview('book2', { rating: 4, content: 'Bravo ok' });
      const r1 = getReviews('book1');
      const r2 = getReviews('book2');
      expect(r1).toHaveLength(1);
      expect(r2).toHaveLength(1);
      expect(r1[0].content).toBe('Alpha ok');
      expect(r2[0].content).toBe('Bravo ok');
    });

  // Verifica que se puede votar una reseña a favor (up) y en contra (down) y los contadores se actualizan
  it('voto positivo suma en up', () => {
      const r = createReview('book1', { rating: 3, content: 'Bueno ok' });
      voteReview('book1', r.id, 1);
      const after = getReviews('book1');
      expect(after[0].up).toBe(1);
      expect(after[0].down).toBe(0);
    });

    it('tolera JSON corrupto y devuelve []', () => {
      localStorage.setItem('reviews:book1', 'not-json');
      const res = getReviews('book1');
      expect(res).toEqual([]);
    });
  });

  // ----------------- [STRICT] -----------------
  describe('[STRICT]', () => {
    it('normaliza contenido con trim y valida longitud mínima', () => {
      const r = createReview('book1', {
        rating: 5,
        content: '   Excelente libro   ',
      });
      const reviews = getReviews('book1');
      expect(reviews[0].content).toBe('Excelente libro');
      expect(r.id).toBeDefined();
    });

    it('rechaza content < 5 caracteres', () => {
      expect(() =>
        createReview('book1', { rating: 5, content: 'hey' })
      ).toThrow();
    });

    it('rechaza rating fuera de rango', () => {
      expect(() =>
        createReview('book1', { rating: 10, content: 'Contenido válido' })
      ).toThrow();
    });

    it('ordena reseñas por createdAt desc', () => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date('2024-01-01T00:00:00.000Z'));
      createReview('book1', { rating: 5, content: 'Primero' });

      vi.setSystemTime(new Date('2024-01-01T00:00:01.000Z'));
      createReview('book1', { rating: 4, content: 'Segundo' });

      const res = getReviews('book1');
      expect(res[0].content).toBe('Segundo');
      expect(res[1].content).toBe('Primero');
    });

    it('voteReview ignora deltas inválidos sin romper', () => {
      const r = createReview('book1', { rating: 3, content: 'Contenido ok' });
      voteReview('book1', r.id, 2 as any); // inválido
      const after = getReviews('book1');
      expect(after).toHaveLength(1);
      expect(after[0].up).toBe(0);
      expect(after[0].down).toBe(0);
    });

    it('voteReview acumula ±1 y no hace underflow', () => {
      const r = createReview('book1', { rating: 3, content: 'Contenido ok' });
      voteReview('book1', r.id, 1);
      voteReview('book1', r.id, -1);
      voteReview('book1', r.id, -1);
      const after = getReviews('book1');
      expect(after[0].up).toBe(1);
      expect(after[0].down).toBe(2);
    });
  });
});


