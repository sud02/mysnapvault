import { NextRequest, NextResponse } from 'next/server';

type Visit = {
  ip: string;
  path: string;
  userAgent: string;
  timestamp: string;
};

const visits: Visit[] = [];

function getClientIp(request: NextRequest): string {
  const xff = request.headers.get('x-forwarded-for');
  if (xff) {
    const parts = xff.split(',').map((p) => p.trim());
    if (parts[0]) return parts[0];
  }
  const realIp = request.headers.get('x-real-ip');
  if (realIp) return realIp;
  const anyReq = request as any;
  if (typeof anyReq.ip === 'string' && anyReq.ip.length > 0) {
    return anyReq.ip;
  }
  return 'unknown';
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const isAdmin = searchParams.get('admin') === '1';
  const password = searchParams.get('password') ?? '';

  const path = searchParams.get('path') ?? '/';

  if (isAdmin) {
    const expected = process.env.ADMIN_PASSWORD ?? '';
    if (!expected || password !== expected) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    return NextResponse.json({
      total: visits.length,
      visits,
    });
  }

  const ip = getClientIp(request);
  const userAgent = request.headers.get('user-agent') ?? '';

  const existingIndex = visits.findIndex((v) => v.ip === ip);
  const newVisit: Visit = {
    ip,
    path,
    userAgent,
    timestamp: new Date().toISOString(),
  };

  if (existingIndex >= 0) {
    visits[existingIndex] = newVisit;
  } else {
    visits.push(newVisit);
  }

  return NextResponse.json({
    total: visits.length,
  });
}
