import Image from 'next/image';
import { listSnaps, type Snap } from '@/lib/snaps';
import { notFound } from 'next/navigation';

type DayItem = { date: string; day: number; has: boolean; preview?: string };

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

  const monthLabel = new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' }).format(
    new Date(year, monthIdx, 1)
  );
  const selectedSnaps = byDay[day] ?? [];
  const selectedDayLabel = `${year}-${pad(monthIdx + 1)}-${pad(day)}`;

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
      <section className="space-y-4">
        <div className="flex items-center justify-between text-sm text-gray-300">
          <div>{monthLabel}</div>
          <div className="text-gray-400">Tap a day to jump</div>
        </div>
        <div className="modules-mic-nav modules-days-grid max-h-[70vh] overflow-y-auto no-scrollbar pr-1">
          {days
            .slice()
            .reverse()
            .map((item) => {
              const href = item.has ? `/day/${item.date}` : undefined;
              const isSelected = item.day === day;
              return (
                <a
                  key={item.date}
                  href={href}
                  className={`modules-card relative overflow-hidden ${item.has ? 'active cursor-pointer' : ''} ${
                    isSelected ? 'ring-2 ring-[#FFCC00]' : ''
                  }`}
                  aria-label={`Open ${item.date}`}
                >
                  {item.has && item.preview ? (
                    <Image
                      src={item.preview}
                      alt=""
                      fill
                      sizes="(max-width: 640px) 22vw, (max-width: 1024px) 14vw, 11vw"
                      className="thumb"
                      priority={isSelected}
                    />
                  ) : (
                    <span className="absolute inset-0 flex items-center justify-center text-xl sm:text-xl md:text-xl font-semibold">
                      {String(item.day).padStart(2, '0')}
                    </span>
                  )}
                </a>
              );
            })}
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-gray-100">{selectedDayLabel}</h2>
        {selectedSnaps.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {selectedSnaps.map((snap, idx) => (
              <figure
                key={snap.url + idx}
                className="relative aspect-[4/5] overflow-hidden rounded-2xl border border-white/10 bg-black/20"
              >
                <Image
                  src={snap.url}
                  alt={snap.name}
                  fill
                  sizes="(max-width: 640px) 90vw, (max-width: 1024px) 45vw, 33vw"
                  className="object-cover"
                  priority={idx === 0}
                />
              </figure>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-400">No snaps for this day yet.</p>
        )}
      </section>
    </div>
  );
}
