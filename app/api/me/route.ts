import { NextResponse } from 'next/server';
import { requireUser } from '@/lib/auth';

export async function GET() {
	try {
		const user = await requireUser();
		return NextResponse.json({
			id: user.id,
			email: user.email ?? '',
			name: user.name ?? ''
		});
	} catch (e: any) {
		return NextResponse.json({ error: e?.message ?? 'Error' }, { status: 401 });
	}
}
