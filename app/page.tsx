export const dynamic = 'force-dynamic';
export const revalidate = 0; // Disable caching completely

import Image from 'next/image';
import { listSnaps, type Snap } from '@/lib/snaps';
import { VisitTracker } from '@/components/VisitTracker';
import YearSelector from '@/components/YearSelector';
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

  // Find which months have photos
  const monthsWithPhotos = new Set<number>();
  for (const s of snaps) {
    if (!s.updated_at) continue;
    const d = new Date(s.updated_at);
    if (d.getFullYear() === selectedYear) {
      monthsWithPhotos.add(d.getMonth());
    }
  }

  // Determine month range to display
  const MIN_YEAR = 2024;
  const MIN_MONTH_INDEX = 8; // September 2024

  // Start with default range based on year
  let lastMonthIndex: number;
  let firstMonthIndex: number;

  if (selectedYear < currentYear) {
    // Past year: show all months, but start from September if it's 2024
    lastMonthIndex = 11;
    firstMonthIndex = selectedYear === MIN_YEAR ? MIN_MONTH_INDEX : 0;
  } else if (selectedYear === currentYear) {
    // Current year: show from September 2024 (if viewing 2024) or January (if viewing 2025+) to current month
    // Always show all months up to current month, even if no photos
    lastMonthIndex = currentMonth;
    firstMonthIndex = selectedYear === MIN_YEAR ? MIN_MONTH_INDEX : 0;
    
    // If we're in 2025 or later, always show from January (month 0)
    if (selectedYear >= 2025) {
      firstMonthIndex = 0;
    }
  } else {
    // Future year: show all months (0-11)
    lastMonthIndex = 11;
    firstMonthIndex = 0;
  }

  // CRITICAL: Always include ALL months that have photos, even if outside the normal range
  // This ensures if you have a photo in November 2025, it shows even if we're in December 2025
  if (monthsWithPhotos.size > 0) {
    const minPhotoMonth = Math.min(...Array.from(monthsWithPhotos));
    const maxPhotoMonth = Math.max(...Array.from(monthsWithPhotos));
    
    // Expand range to include all months with photos
    firstMonthIndex = Math.min(firstMonthIndex, minPhotoMonth);
    
    // Show up to the latest month with photos (even if it's before current month)
    // This fixes the issue where November 2025 disappears when viewing December 2025
    lastMonthIndex = Math.max(lastMonthIndex, maxPhotoMonth);
  }

  // DEBUG: Log what we're showing
  console.log(`📅 Year: ${selectedYear}, Current: ${currentYear}, Current Month: ${currentMonth}`);
  console.log(`📅 Months with photos: ${Array.from(monthsWithPhotos).join(', ')}`);
  console.log(`📅 Range: ${firstMonthIndex} to ${lastMonthIndex}`);

  const monthsToRender: number[] = [];
  if (lastMonthIndex >= firstMonthIndex && lastMonthIndex >= 0 && firstMonthIndex <= 11) {
    for (let m = lastMonthIndex; m >= firstMonthIndex; m--) {
      monthsToRender.push(m);
    }
  }

  // Get all years that have photos
  const yearsWithPhotos = new Set<number>();
  for (const s of snaps) {
    if (!s.updated_at) continue;
    const d = new Date(s.updated_at);
    yearsWithPhotos.add(d.getFullYear());
  }
  const allAvailableYears = Array.from(yearsWithPhotos).sort((a, b) => b - a);
  if (allAvailableYears.length === 0) {
    allAvailableYears.push(currentYear);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-center flex-1">Snap Of The Day</h1>
        <YearSelector currentYear={selectedYear} availableYears={allAvailableYears} />
      </div>
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
