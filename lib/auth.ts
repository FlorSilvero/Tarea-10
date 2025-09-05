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
    .setSubject(user.id)                // 👈 acá guardamos el _id del user
    .setIssuedAt()
    .setExpirationTime(EXPIRES_IN)
    .sign(JWT_SECRET);

  const jar = await cookies();
  jar.set({
    name: COOKIE_NAME,
    value: token,
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    // opcional: maxAge en segundos (ej 7 días)
  });
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

export async function getSession(): Promise<{ id: string; email?: string; name?: string } | null> {
  try {
    const jar = await cookies();
    const token = jar.get(COOKIE_NAME)?.value;
    if (!token) return null;
    const { payload } = await jwtVerify<UserToken>(token, JWT_SECRET);
    if (!payload?.sub) return null;
    return { id: payload.sub, email: payload.email, name: payload.name };
  } catch {
    return null;
  }
}

export async function requireUser() {
  const s = await getSession();
  if (!s) throw Object.assign(new Error("Unauthorized"), { status: 401 });
  return s;
}
