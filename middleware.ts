
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';
import { COOKIE_NAME } from './lib/auth';

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Rutas que requieren sesión
  const protectedRoutes = [
    '/me',
    '/book',
    '/mi-perfil',
    '/perfil',
    '/dashboard',
    '/api/reviews/private'
  ];

  const needsAuth = protectedRoutes.some((r) => pathname.startsWith(r));
  if (!needsAuth) return NextResponse.next();

  const token = req.cookies.get(COOKIE_NAME)?.value;
  if (!token) {
    const url = req.nextUrl.clone();
    url.pathname = '/auth';
    url.searchParams.set('next', pathname);
    return NextResponse.redirect(url);
  }

  try {
    await jwtVerify(token, new TextEncoder().encode(process.env.JWT_SECRET || 'dev_secret_min_32_chars'));
    return NextResponse.next();
  } catch {
    const url = req.nextUrl.clone();
    url.pathname = '/auth';
    url.searchParams.set('next', pathname);
    return NextResponse.redirect(url);
  }
}

export const config = {
  matcher: ['/me', '/book/:path*', '/mi-perfil', '/perfil/:path*', '/dashboard/:path*', '/api/reviews/private'],
};
