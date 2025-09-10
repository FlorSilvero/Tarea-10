import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

const COOKIE_NAME = process.env.COOKIE_NAME || "session";
const secret = process.env.JWT_SECRET || "dev_secret_min_32_chars";
const JWT_SECRET = new TextEncoder().encode(secret);
const EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";

type UserToken = { sub: string; email: string; name?: string };

export async function createSession(user: { id: string; email: string; name?: string }) {
  const token = await new SignJWT({ email: user.email, name: user.name })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(user.id)
    .setIssuedAt()
    .setExpirationTime(EXPIRES_IN)
    .sign(JWT_SECRET);
  return token;
}

export async function destroySession() {
  const jar = await cookies();
  jar.set({
    name: COOKIE_NAME,
    value: "",
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });
}

export async function getSession(req: RequireUserRequest) {
  let token;
  if (req && req.headers) {
    // Para tests con Express
    const cookieHeader = req.headers.get?.('cookie') || (typeof req.headers.cookie === 'string' ? req.headers.cookie : '');
    token = cookieHeader?.match(/session=([^;]+)/)?.[1];
  } else {
    // Next.js normal
    const jar = await cookies();
    token = jar.get(COOKIE_NAME)?.value;
  }
  try {
    if (!token) return null;
    const { payload } = await jwtVerify<UserToken>(token, JWT_SECRET);
    if (!payload?.sub) return null;
    return { id: payload.sub, email: payload.email, name: payload.name };
  } catch {
    return null;
  }
}

interface RequireUserRequest {
  headers?: {
    get?: (name: string) => string | undefined;
    cookie?: string;
    [key: string]: any;
  };
  [key: string]: any;
}

interface RequireUserSession {
  id: string;
  email: string;
  name?: string;
}

export async function requireUser(req: RequireUserRequest): Promise<RequireUserSession> {
  const s = await getSession(req);
  if (!s) throw Object.assign(new Error("Unauthorized"), { status: 401 });
  return s;
}

// Mock para tests unitarios
export async function login(email: string, password: string): Promise<{ email: string }> {
  throw new Error('Not implemented: use API');
}

export function isAuthenticated() {
  return false;
}
