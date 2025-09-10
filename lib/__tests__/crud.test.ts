import { describe, it, expect, vi } from 'vitest';
import * as db from '../review.locals';


describe('CRUD reviews', () => {
  it('crea una reseña válida', () => {
    const review = db.createReview('vol1', { rating: 5, content: 'Excelente libro' });
    expect(review.rating).toBe(5);
    expect(review.content).toBe('Excelente libro');
  });

  it('rechaza reseña inválida', () => {
    expect(() => db.createReview('vol1', { rating: 0, content: 'ok' })).toThrow();
  });

  it('lee reseñas ordenadas', () => {
    db.createReview('vol1', { rating: 3, content: 'Contenido A' });
    db.createReview('vol1', { rating: 4, content: 'Contenido B' });
    const reviews = db.getReviews('vol1');
    expect(reviews[0].createdAt >= reviews[1].createdAt).toBe(true);
  });

  it('vota una reseña', () => {
    const r = db.createReview('vol1', { rating: 5, content: 'Votame' });
    db.voteReview('vol1', r.id, 1);
    const reviews = db.getReviews('vol1');
    const voted = reviews.find(rv => rv.id === r.id);
    expect(voted?.up).toBe(1);
  });
});
