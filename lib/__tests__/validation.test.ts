import { describe, it, expect } from 'vitest';
import { reviewSchema } from '../review.locals';
import React from 'react';

describe('validación de reseñas', () => {
  it('acepta reseña válida', () => {
    const data = { id: '1', rating: 5, content: 'Muy bueno', up: 0, down: 0, createdAt: new Date().toISOString() };
    expect(reviewSchema.safeParse(data).success).toBe(true);
  });

  it('rechaza reseña con rating fuera de rango', () => {
    const data = { id: '1', rating: 0, content: 'Mal', up: 0, down: 0, createdAt: new Date().toISOString() };
    expect(reviewSchema.safeParse(data).success).toBe(false);
  });

  it('rechaza reseña con contenido corto', () => {
    const data = { id: '1', rating: 3, content: 'ok', up: 0, down: 0, createdAt: new Date().toISOString() };
    expect(reviewSchema.safeParse(data).success).toBe(false);
  });
});
