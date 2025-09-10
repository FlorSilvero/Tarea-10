import { describe, it, expect } from 'vitest';
// Suponiendo que tienes lógica para verificar si el usuario puede editar/eliminar/votar
import { canEdit, canVote } from '../authz';
import React from 'react';

describe('casos de autorización', () => {
  it('permite editar si es el autor', () => {
    const user = { email: 'a@a.com' };
    const review = { user: { email: 'a@a.com' } };
    expect(canEdit(user, review)).toBe(true);
  });

  it('deniega editar si no es el autor', () => {
    const user = { email: 'b@b.com' };
    const review = { user: { email: 'a@a.com' } };
    expect(canEdit(user, review)).toBe(false);
  });

  it('permite votar si no ha votado antes', () => {
    const user = { email: 'a@a.com' };
    const review = { votes: [] };
    expect(canVote(user, review)).toBe(true);
  });

  it('deniega votar si ya votó', () => {
    const user = { email: 'a@a.com' };
    const review = { votes: [{ user: 'a@a.com', type: 'like' }] };
    expect(canVote(user, review)).toBe(false);
  });
});
