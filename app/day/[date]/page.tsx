import { listSnaps, type Snap } from '@/lib/snaps';
import { notFound } from 'next/navigation';
import MonthAppleCarousel, { type DayItem } from '@/components/MonthAppleCarousel';

function isValidDateParam(date: string) {
  return /^\d{4}-\d{2}-\d{2}$/.test(date);
}

function sameYMD(a: Date, y: number, m: number, d: number) {
  return a.getFullYear() === y && a.getMonth() === m && a.getDate() === d;
}

export default async function DayPage({ params }: { params: { date: string } }) {
  const { date } = params;
  if (!isValidDateParam(date)) return notFound();
  const [y, m, d] = date.split('-').map((x) => parseInt(x, 10));
  const year = y;
  const monthIdx = (m || 1) - 1;
  const day = d;

  const all = await listSnaps();
  const pad = (n: number) => String(n).padStart(2, '0');
  const daysInMonth = new Date(year, monthIdx + 1, 0).getDate();
  const byDay: Record<number, Snap[]> = {} as any;
  for (let i = 1; i <= daysInMonth; i++) byDay[i] = [];
  for (const s of all) {
    if (!s.updated_at) continue;
    const dt = new Date(s.updated_at);
    if (dt.getFullYear() === year && dt.getMonth() === monthIdx) {
      byDay[dt.getDate()].push(s);
    }
  }
  for (let i = 1; i <= daysInMonth; i++) {
    byDay[i].sort((a, b) => (b.updated_at || '').localeCompare(a.updated_at || ''));
  }
  const days: DayItem[] = Array.from({ length: daysInMonth }, (_, i) => {
    const dd = i + 1;
    const snaps = byDay[dd];
    return {
      date: `${year}-${pad(monthIdx + 1)}-${pad(dd)}`,
      day: dd,
      has: snaps.length > 0,
      preview: snaps[0]?.url,
    };
  });

  return (
    <div className="space-y-8">
      <div>
        <a href="/" className="button" aria-label="Go back">
          <span className="button-box">
            <svg className="button-elem" viewBox="0 0 46 40" aria-hidden="true">
              <path d="M29 10 L17 23 L29 36" strokeWidth="3" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
        </a>
      </div>
      {/* Month Apple carousel over full month; centers current day and updates URL/date smoothly */}
      <MonthAppleCarousel days={days} initialIndex={day - 1} />
    </div>
  );
}
