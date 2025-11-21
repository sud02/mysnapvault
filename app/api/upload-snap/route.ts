import { NextResponse } from 'next/server';
import { put } from '@vercel/blob';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  const secretHeader = request.headers.get('x-upload-secret') || '';
  const expected = process.env.UPLOAD_SECRET || '';
  if (!expected || secretHeader !== expected) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const form = await request.formData();
  const file = form.get('file') as File | null;
  if (!file) {
    return NextResponse.json({ error: 'Missing file' }, { status: 400 });
  }
  if (file.size > 50 * 1024 * 1024) {
    return NextResponse.json({ error: 'File too large (max 50 MB)' }, { status: 413 });
  }
  const ext = file.name.includes('.') ? file.name.split('.').pop() : '';
  const safeExt = (ext || '').toLowerCase().replace(/[^a-z0-9]/g, '');
  const ts = Date.now();
  const rand = Math.random().toString(36).slice(2, 8);
  const path = `${ts}-${rand}${safeExt ? '.' + safeExt : ''}`;
  try {
    const arrayBuffer = await file.arrayBuffer();
    const blob = await put(path, arrayBuffer, {
      access: 'public',
      contentType: file.type || 'application/octet-stream',
      addRandomSuffix: false,
      cacheControlMaxAge: 60 * 60 * 24 * 30,
    });
    return NextResponse.json({ path: blob.pathname, url: blob.url, uploadedAt: new Date().toISOString() }, { status: 200 });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Server error' }, { status: 500 });
  }
}
