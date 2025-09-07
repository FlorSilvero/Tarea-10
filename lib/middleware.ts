// Mock de middleware de autorización
export function authorize(req: { user?: { email: string; role?: string } }, roles: string[]) {
  if (!req.user) return false;
  return roles.includes(req.user.role || '');
}
