import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

type Visit = {
  ip: string;
  path: string;
  userAgent: string;
  timestamp: string;
  latitude?: number;
  longitude?: number;
};

const visits: Visit[] = [];

async function sendAlertEmail(visit: Visit) {
  const host = process.env.SMTP_HOST;
  const portStr = process.env.SMTP_PORT;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const to = process.env.ALERT_EMAIL_TO;

  if (!host || !portStr || !user || !pass || !to) {
    // Missing configuration; skip sending
    return;
  }

  const port = Number(portStr) || 587;

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: {
      user,
      pass,
    },
  });

  const subject = `New visitor on My Snap Vault`;
  const textLines = [
    `A new unique visitor has been detected on My Snap Vault.`,
    '',
    `IP: ${visit.ip}`,
    `Path: ${visit.path}`,
    `Time: ${visit.timestamp}`,
    visit.latitude != null && visit.longitude != null
      ? `Location (lat, lon): ${visit.latitude}, ${visit.longitude}`
      : undefined,
    visit.latitude != null && visit.longitude != null
      ? `Map: https://www.google.com/maps?q=${visit.latitude},${visit.longitude}`
      : undefined,
    `User-Agent: ${visit.userAgent}`,
  ].filter((l): l is string => Boolean(l));

  const html = `
    <div style="font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; line-height: 1.5; font-size: 14px; color: #111827;">
      <h2 style="margin: 0 0 8px; font-size: 16px;">New visitor on <span style="font-weight: 600;">My Snap Vault</span></h2>
      <p style="margin: 0 0 12px;">A new unique visitor has been detected.</p>
      <table style="border-collapse: collapse; width: 100%; max-width: 600px;">
        <tbody>
          <tr>
            <td style="padding: 4px 8px; font-weight: 600; width: 80px;">IP</td>
            <td style="padding: 4px 8px;">${visit.ip}</td>
          </tr>
          <tr>
            <td style="padding: 4px 8px; font-weight: 600;">Path</td>
            <td style="padding: 4px 8px;">${visit.path}</td>
          </tr>
          <tr>
            <td style="padding: 4px 8px; font-weight: 600;">Time</td>
            <td style="padding: 4px 8px;">${visit.timestamp}</td>
          </tr>
          ${
            visit.latitude != null && visit.longitude != null
              ? `<tr>
                  <td style="padding: 4px 8px; font-weight: 600;">Location</td>
                  <td style="padding: 4px 8px;">
                    <div>
                      <div>${visit.latitude}, ${visit.longitude}</div>
                      <div>
                        <a href="https://www.google.com/maps?q=${visit.latitude},${visit.longitude}" target="_blank" rel="noreferrer" style="color: #2563eb; text-decoration: underline;">View on map</a>
                      </div>
                    </div>
                  </td>
                </tr>`
              : ''
          }
          <tr>
            <td style="padding: 4px 8px; font-weight: 600;">User-Agent</td>
            <td style="padding: 4px 8px;">${visit.userAgent}</td>
          </tr>
        </tbody>
      </table>
    </div>
  `;

  try {
    await transporter.sendMail({
      from: user,
      to,
      subject,
      text: textLines.join('\n'),
      html,
    });
  } catch {
    // Ignore email errors; tracking should still work
  }
}

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
  const latStr = searchParams.get('lat');
  const lonStr = searchParams.get('lon');

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

  const latitude = latStr != null ? Number(latStr) : undefined;
  const longitude = lonStr != null ? Number(lonStr) : undefined;

  const existingIndex = visits.findIndex((v) => v.ip === ip);
  const newVisit: Visit = {
    ip,
    path,
    userAgent,
    timestamp: new Date().toISOString(),
    ...(typeof latitude === 'number' && Number.isFinite(latitude) ? { latitude } : {}),
    ...(typeof longitude === 'number' && Number.isFinite(longitude) ? { longitude } : {}),
  };

  if (existingIndex >= 0) {
    visits[existingIndex] = newVisit;
  } else {
    visits.push(newVisit);
    await sendAlertEmail(newVisit);
  }

  return NextResponse.json({
    total: visits.length,
  });
}
