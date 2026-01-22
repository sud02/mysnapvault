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
  
  // Log snap loading status
  console.log(`📊 Total snaps loaded: ${snaps.length}`);
  if (snaps.length === 0) {
    console.error('❌ NO SNAPS FOUND! Check:');
    console.error('   1. Supabase bucket name matches SNAPS_BUCKET env var');
    console.error('   2. Bucket is public');
    console.error('   3. Environment variables are set in Vercel');
  } else {
    console.log(`📊 Sample snap: ${snaps[0]?.name} → ${snaps[0]?.updated_at}`);
  }

  const parsedYear = Number.parseInt(searchParams?.year ?? '', 10);
  let selectedYear = Number.isFinite(parsedYear) ? parsedYear : currentYear;
  
  // Don't allow viewing future years - cap at current year
  if (selectedYear > currentYear) {
    console.warn(`⚠️  Attempted to view future year ${selectedYear}, capping to ${currentYear}`);
    selectedYear = currentYear;
  }
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
    const snapYear = d.getFullYear();
    if (snapYear === selectedYear) {
      const monthIdx = d.getMonth();
      const dayNum = d.getDate();
      if (byMonthDay[monthIdx]?.[dayNum]) {
        byMonthDay[monthIdx][dayNum].push(s);
      }
    }
  }
  
  // DEBUG: Log snaps by year
  const snapsByYear: Record<number, number> = {};
  for (const s of snaps) {
    if (!s.updated_at) continue;
    const d = new Date(s.updated_at);
    const year = d.getFullYear();
    snapsByYear[year] = (snapsByYear[year] || 0) + 1;
  }
  console.log(`📊 Snaps by year:`, snapsByYear);
  console.log(`📊 Viewing year: ${selectedYear}, Found ${snaps.filter(s => {
    if (!s.updated_at) return false;
    return new Date(s.updated_at).getFullYear() === selectedYear;
  }).length} snaps for this year`);

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
    // Current year: show from September 2024 (if viewing 2024) or January (if viewing 2025+) up to CURRENT MONTH ONLY
    // This ensures future months don't appear until they become the current month
    lastMonthIndex = currentMonth; // Only show up to current month
    firstMonthIndex = selectedYear === MIN_YEAR ? MIN_MONTH_INDEX : 0;
    
    // If we're in 2025 or later, start from January
    if (selectedYear >= 2025) {
      firstMonthIndex = 0;
    }
  } else {
    // Future year: Don't show future years at all (they'll appear when they become current)
    lastMonthIndex = -1;
    firstMonthIndex = -1;
  }

  // CRITICAL: Always include ALL months that have photos, but NEVER exceed current month
  // This ensures if you have a photo in November 2025, it shows even if we're in December 2025
  // But won't show January 2026 until we're actually in January 2026
  if (monthsWithPhotos.size > 0) {
    const minPhotoMonth = Math.min(...Array.from(monthsWithPhotos));
    const maxPhotoMonth = Math.max(...Array.from(monthsWithPhotos));
    
    // Expand range to include all months with photos
    firstMonthIndex = Math.min(firstMonthIndex, minPhotoMonth);
    
    // But cap at current month - never show future months
    if (selectedYear === currentYear) {
      lastMonthIndex = Math.min(Math.max(lastMonthIndex, maxPhotoMonth), currentMonth);
    } else {
      lastMonthIndex = Math.max(lastMonthIndex, maxPhotoMonth);
    }
  }

  // DEBUG: Log what we're showing
  console.log(`📅 Year: ${selectedYear}, Current: ${currentYear}, Current Month: ${currentMonth}`);
  console.log(`📅 Months with photos: ${Array.from(monthsWithPhotos).join(', ')}`);
  console.log(`📅 Range: ${firstMonthIndex} to ${lastMonthIndex}`);

  const monthsToRender: number[] = [];
  // Only render if we have valid month indices and it's not a future year
  if (lastMonthIndex >= firstMonthIndex && lastMonthIndex >= 0 && firstMonthIndex >= 0 && firstMonthIndex <= 11) {
    for (let m = lastMonthIndex; m >= firstMonthIndex; m--) {
      monthsToRender.push(m);
    }
  }

  // Get all years that have photos
  const yearsWithPhotos = new Set<number>();
  for (const s of snaps) {
    if (!s.updated_at) continue;
    const d = new Date(s.updated_at);
    const year = d.getFullYear();
    if (!isNaN(year) && year >= 2020 && year <= 2030) {
      yearsWithPhotos.add(year);
    }
  }
  const allAvailableYears = Array.from(yearsWithPhotos).sort((a, b) => b - a);
  
  // If no photos found, default to current year
  if (allAvailableYears.length === 0) {
    allAvailableYears.push(currentYear);
    console.warn(`⚠️  No snaps found! Defaulting to current year: ${currentYear}`);
    console.warn(`⚠️  Total snaps loaded: ${snaps.length}`);
  }
  
  // Ensure selected year is valid - if viewing future year with no photos, redirect to current year
  if (selectedYear > currentYear && !yearsWithPhotos.has(selectedYear)) {
    console.warn(`⚠️  Selected year ${selectedYear} is in future and has no photos. Redirecting to ${currentYear}`);
    // Note: Can't redirect in server component, but we'll handle it in the logic
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-center flex-1">Snap Of The Day</h1>
        <YearSelector currentYear={selectedYear} availableYears={allAvailableYears} />
      </div>
      <VisitTracker />
      {snaps.length === 0 && (
        <div className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-4">
          <h2 className="font-semibold text-yellow-800 mb-2">⚠️ No Images Found</h2>
          <p className="text-sm text-yellow-700 mb-2">No snaps are loading from Supabase. Please check:</p>
          <ul className="text-sm text-yellow-700 list-disc list-inside space-y-1">
            <li>Environment variables are set in Vercel (SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, SNAPS_BUCKET)</li>
            <li>Bucket name matches exactly (case-sensitive): Check Supabase Dashboard → Storage</li>
            <li>Bucket is set to "Public" in Supabase</li>
            <li>Visit <a href="/api/debug" className="underline" target="_blank">/api/debug</a> to see configuration status</li>
          </ul>
        </div>
      )}
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
