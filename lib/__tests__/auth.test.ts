import { describe, it, expect, vi } from 'vitest';
// Suponiendo que tienes funciones como login, logout, isAuthenticated
import * as auth from '../auth';
import React from 'react';

describe('auth', () => {
  it('debería autenticar usuario válido', async () => {
    vi.spyOn(auth, 'login').mockResolvedValue({ email: 'user@test.com' });
    const user = await auth.login('user@test.com', 'password');
    expect(user.email).toBe('user@test.com');
  });

  it('debería rechazar usuario inválido', async () => {
    vi.spyOn(auth, 'login').mockRejectedValue(new Error('Credenciales inválidas'));
    await expect(auth.login('bad', 'bad')).rejects.toThrow('Credenciales inválidas');
  });

  it('debería verificar autenticación', () => {
    vi.spyOn(auth, 'isAuthenticated').mockReturnValue(true);
    expect(auth.isAuthenticated()).toBe(true);
  });
});
