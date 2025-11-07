import { NextResponse } from 'next/server';
import { listSnaps } from '@/lib/snaps';

export const runtime = 'nodejs';

export async function GET() {
  try {
    const snaps = await listSnaps();
    return NextResponse.json(snaps, { status: 200 });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Server error' }, { status: 500 });
  }
}
