import { NextResponse } from 'next/server';
import { requireUser } from '@/lib/auth';

export async function GET() {
  try {
    const user = await requireUser();
    return NextResponse.json({ email: user.email, id: user.id, name: user.name }, { status: 200 });
  } catch (e: any) {
    return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
  }
}
