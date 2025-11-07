export const dynamic = 'force-dynamic';

import { listSnaps, type Snap } from '@/lib/snaps';
// Reverted: using monthly day grid view

export default async function Page() {
  const snaps: Snap[] = await listSnaps();
  const now = new Date();
  const year = now.getFullYear();
  const currentMonth = now.getMonth();
  const daysInMonth = (m: number) => new Date(year, m + 1, 0).getDate();
  const byMonthDay: Record<number, Record<number, Snap[]>> = {} as any;
  for (let m = 0; m < 12; m++) {
    byMonthDay[m] = {} as any;
    const days = daysInMonth(m);
    for (let d = 1; d <= days; d++) byMonthDay[m][d] = [];
  }
  for (const s of snaps) {
    const d = s.updated_at ? new Date(s.updated_at) : null;
    if (d && d.getFullYear() === year) {
      byMonthDay[d.getMonth()][d.getDate()].push(s);
    }
  }
  const monthName = (m: number) =>
    new Intl.DateTimeFormat('en-US', { month: 'long' }).format(new Date(year, m, 1));

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Snap Of The Day</h1>
      <div className="gallery-wrap fit-viewport">
        <section className="modules-month" key={currentMonth}>
          <h2>
            {monthName(currentMonth)} {year}
          </h2>
          <div className="modules-mic-nav modules-days-grid">
            {Array.from({ length: daysInMonth(currentMonth) }, (_, i) => daysInMonth(currentMonth) - i).map((day) => {
              const daySnaps = byMonthDay[currentMonth][day];
              const has = daySnaps.length > 0;
              return (
                <a
                  key={day}
                  href={has ? `/day/${year}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}` : undefined}
                  className={`modules-card relative overflow-hidden ${has ? 'active cursor-pointer' : ''}`}
                  aria-label={`Open ${year}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`}
                >
                  {has ? (
                    <img src={daySnaps[0].url} alt="" className="thumb" />
                  ) : (
                    <span className="absolute inset-0 flex items-center justify-center text-xl sm:text-xl md:text-xl font-semibold">
                      {String(day).padStart(2, '0')}
                    </span>
                  )}
                </a>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
}
