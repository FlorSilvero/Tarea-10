import { NextResponse } from 'next/server';
import { requireUser } from '@/lib/auth';
import { connectToDB } from '@/lib/db';
import User from '@/models/User';

export async function GET(req: Request) {
	try {
				 const user = await requireUser({
					 ...req,
					 headers: {
						 get: (key: string) => req.headers.get(key) ?? undefined
					 }
				 });
		await connectToDB();
		const dbUser = await User.findById(user.id).lean();
		return NextResponse.json({
			id: user.id,
			email: user.email ?? '',
			name: user.name ?? '',
			favorites: Array.isArray(dbUser) ? [] : dbUser?.favorites ?? []
		});
	} catch (e: any) {
		return NextResponse.json({ error: e?.message ?? 'Error' }, { status: 401 });
	}
}
