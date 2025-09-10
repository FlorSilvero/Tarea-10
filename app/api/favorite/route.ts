import { NextResponse } from 'next/server';
import { requireUser } from '@/lib/auth';
import { connectToDB } from '@/lib/db';
import User from '@/models/User';

export async function POST(req: Request) {
  try {
    const { volumeId } = await req.json();
    if (!volumeId) return NextResponse.json({ error: 'Falta volumeId' }, { status: 400 });
    const user = await requireUser({
      ...req,
      headers: {
        get: (key: string) => req.headers.get(key) ?? undefined
      }
    });
    await connectToDB();
    const u = await User.findById(user.id);
    if (!u) return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });
    if (!u.favorites.includes(volumeId)) {
      u.favorites.push(volumeId);
      await u.save();
    }
    return NextResponse.json({ ok: true, favorites: u.favorites });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? 'Error' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { volumeId } = await req.json();
    if (!volumeId) return NextResponse.json({ error: 'Falta volumeId' }, { status: 400 });
    const user = await requireUser({
      ...req,
      headers: {
        get: (key: string) => req.headers.get(key) ?? undefined
      }
    });
    await connectToDB();
    const u = await User.findById(user.id);
    if (!u) return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });
    u.favorites = u.favorites.filter((id: string) => id !== volumeId);
    await u.save();
    return NextResponse.json({ ok: true, favorites: u.favorites });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? 'Error' }, { status: 500 });
  }
}
