import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectToDB } from "@/lib/db";
import User from "@/models/User";
import { createSession } from "@/lib/auth";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const { email, password, name } = await req.json();
    if (!email || !password) {
      return NextResponse.json({ error: "Email y password son requeridos" }, { status: 400 });
    }
    await connectToDB();

    const exists = await User.findOne({ email }).lean();
    if (exists) return NextResponse.json({ error: "Email ya registrado" }, { status: 409 });

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({ email, passwordHash, name: name ?? "" });

    await createSession({ id: user._id.toString(), email: user.email, name: user.name });
    return NextResponse.json({ ok: true, user: { id: user._id, email: user.email, name: user.name } }, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? "Error" }, { status: 500 });
  }
}
