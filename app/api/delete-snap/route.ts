import { NextResponse } from 'next/server';
import { del } from '@vercel/blob';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  const secretHeader = request.headers.get('x-upload-secret') || '';
  const expected = process.env.UPLOAD_SECRET || '';
  if (!expected || secretHeader !== expected) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const path = typeof (payload as any)?.path === 'string' ? (payload as any).path.trim() : '';
  if (!path) {
    return NextResponse.json({ error: 'Missing path' }, { status: 400 });
  }

  try {
    await del(path);
    return NextResponse.json({ ok: true, path }, { status: 200 });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Server error' }, { status: 500 });
  }
}
