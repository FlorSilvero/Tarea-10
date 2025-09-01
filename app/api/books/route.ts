import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q');
  if (!q) {
    return NextResponse.json({ error: 'Missing query' }, { status: 400 });
  }
  const url = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(q)}`;
  const res = await fetch(url);
  if (!res.ok) {
    return NextResponse.json({ error: 'Google Books API error' }, { status: 500 });
  }
  const data = await res.json();
  return NextResponse.json(data);
}
