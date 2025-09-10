import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

const COOKIE_NAME = process.env.COOKIE_NAME || 'session';
const secret = process.env.JWT_SECRET || 'dev_secret_min_32_chars';
const JWT_SECRET = new TextEncoder().encode(secret);

const protectedRoutes = [
  /^\/me(\/.*)?$/,
  /^\/book(\/.*)?$/,
  /^\/$/
];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const isProtected = protectedRoutes.some((re) => re.test(pathname));
  if (!isProtected) return NextResponse.next();

  const token = req.cookies.get(COOKIE_NAME)?.value;
  if (!token) {
    return NextResponse.redirect(new URL('/auth', req.url));
  }
  try {
    await jwtVerify(token, JWT_SECRET);
    return NextResponse.next();
  } catch {
    return NextResponse.redirect(new URL('/auth', req.url));
  }
}

export const config = {
  matcher: ['/me', '/book/:path*', '/'],
};
