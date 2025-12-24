import { NextResponse } from 'next/server';
import { listSnaps } from '@/lib/snaps';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    const snaps = await listSnaps();
    const response = NextResponse.json(snaps, { status: 200 });
    
    // Add aggressive cache control headers
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
    
    return response;
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Server error' }, { status: 500 });
  }
}
