import { NextResponse } from "next/server";
import { COOKIE_NAME } from "@/lib/auth";
import bcrypt from "bcryptjs";
import { connectToDB } from "@/lib/db";
import User from "@/models/User";
import { createSession } from "@/lib/auth";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();
    if (!email || !password) {
      return NextResponse.json(
        { error: "Email y password son requeridos" },
        { status: 400 }
      );
    }

    await connectToDB();

    const user = await User.findOne({ email });
    if (!user) {
      return NextResponse.json({ error: "Credenciales inválidas" }, { status: 401 });
    }

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) {
      return NextResponse.json({ error: "Credenciales inválidas" }, { status: 401 });
    }

    // Genera el JWT real y lo setea en la cookie
    const token = await createSession({
      id: user._id.toString(),
      email: user.email,
      name: user.name,
    });
    const res = NextResponse.json({
      ok: true,
      user: { id: user._id, email: user.email, name: user.name },
    }, { status: 200 });
    res.cookies.set(COOKIE_NAME, token, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
    });
    return res;
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message ?? "Error" },
      { status: 500 }
    );
  }
}
