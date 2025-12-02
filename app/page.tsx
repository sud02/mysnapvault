export const dynamic = 'force-dynamic';

import Image from 'next/image';
import { listSnaps, type Snap } from '@/lib/snaps';
import { VisitTracker } from '@/components/VisitTracker';
// Reverted: using monthly day grid view

type PageProps = {
  searchParams?: {
    year?: string;
  };
};

export default async function Page({ searchParams }: PageProps) {
  const snaps: Snap[] = await listSnaps();
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();
  const currentDay = now.getDate();

  const parsedYear = Number.parseInt(searchParams?.year ?? '', 10);
  const selectedYear = Number.isFinite(parsedYear) ? parsedYear : currentYear;
  const daysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();

  const byMonthDay: Record<number, Record<number, Snap[]>> = {} as Record<number, Record<number, Snap[]>>;
  for (let m = 0; m < 12; m++) {
    byMonthDay[m] = {} as Record<number, Snap[]>;
    const days = daysInMonth(selectedYear, m);
    for (let d = 1; d <= days; d++) byMonthDay[m][d] = [];
  }

  for (const s of snaps) {
    if (!s.updated_at) continue;
    const d = new Date(s.updated_at);
    if (d.getFullYear() === selectedYear) {
      const monthIdx = d.getMonth();
      const dayNum = d.getDate();
      if (byMonthDay[monthIdx]?.[dayNum]) {
        byMonthDay[monthIdx][dayNum].push(s);
      }
    }
  }

  const monthName = (month: number) =>
    new Intl.DateTimeFormat('en-US', { month: 'long' }).format(new Date(selectedYear, month, 1));

  const MIN_YEAR = 2025;
  const MIN_MONTH_INDEX = 10; // November

  const lastMonthIndex = selectedYear < currentYear ? 11 : selectedYear === currentYear ? currentMonth : -1;
  const firstMonthIndex = selectedYear < MIN_YEAR ? 12 : selectedYear === MIN_YEAR ? MIN_MONTH_INDEX : 0;

  const monthsToRender: number[] = [];
  if (lastMonthIndex >= firstMonthIndex && lastMonthIndex >= 0 && firstMonthIndex <= 11) {
    for (let m = lastMonthIndex; m >= firstMonthIndex; m--) {
      monthsToRender.push(m);
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-center">Snap Of The Day</h1>
      <VisitTracker />
      <div className="space-y-10">
        {monthsToRender.map((monthIdx) => {
          const daysThisMonth = daysInMonth(selectedYear, monthIdx);
          const isCurrentMonth = selectedYear === currentYear && monthIdx === currentMonth;
          return (
            <div key={`${selectedYear}-${monthIdx}`} className="space-y-4" id={`month-${monthIdx + 1}`}>
              <div className="gallery-wrap fit-viewport">
                <section className="modules-month has-title">
                  <div className="month-title">
                    <span>{monthName(monthIdx)}</span>
                    <span className="month-year">{selectedYear}</span>
                  </div>
                  <div className="modules-mic-nav modules-days-grid">
                    {Array.from({ length: daysThisMonth }, (_, i) => daysThisMonth - i).map((day) => {
                      const daySnaps = byMonthDay[monthIdx][day];
                      const has = daySnaps.length > 0;
                      const dayHref = `/day/${selectedYear}-${String(monthIdx + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                      return (
                        <a
                          key={`${monthIdx}-${day}`}
                          href={has ? dayHref : undefined}
                          className={`modules-card relative overflow-hidden ${has ? 'active cursor-pointer' : ''}`}
                          aria-label={`Open ${selectedYear}-${String(monthIdx + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`}
                        >
                          {has ? (
                            <Image
                              src={daySnaps[0].url}
                              alt=""
                              fill
                              sizes="(max-width: 640px) 22vw, (max-width: 1024px) 14vw, 11vw"
                              className="thumb"
                              priority={isCurrentMonth && day === currentDay}
                            />
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
        })}
        {monthsToRender.length === 0 && (
          <p className="text-center text-sm text-gray-400">No months to display yet for {selectedYear}.</p>
        )}
      </div>
    </div>
  );
}
