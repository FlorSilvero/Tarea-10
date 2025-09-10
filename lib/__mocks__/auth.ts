// ...existing code...

// ...existing code...
// Mocks para tests unitarios
export async function login(email: string, password: string): Promise<{ email: string }> {
  if (email === 'user@test.com' && password === 'password') {
    return { email };
  }
  throw new Error('Credenciales inválidas');
}

export function isAuthenticated(): boolean {
  return true;
}
