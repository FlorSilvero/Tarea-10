import { describe, it, expect } from 'vitest';
// Suponiendo que tienes un middleware de autorización
import { authorize } from '../middleware';

describe('middleware autorización', () => {
  it('permite acceso a usuario autorizado', () => {
    const req = { user: { email: 'user@test.com', role: 'admin' } };
    expect(authorize(req, ['admin'])).toBe(true);
  });

  it('deniega acceso a usuario no autorizado', () => {
    const req = { user: { email: 'user@test.com', role: 'user' } };
    expect(authorize(req, ['admin'])).toBe(false);
  });
});
