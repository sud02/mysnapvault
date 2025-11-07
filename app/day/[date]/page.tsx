import { listSnaps, type Snap } from '@/lib/snaps';
import { notFound } from 'next/navigation';
import { Carousel, Card } from '@/components/ui/apple-cards-carousel';

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
  // Compute snaps for the active day
  const daySnaps: Snap[] = all
    .filter((s) => (s.updated_at ? sameYMD(new Date(s.updated_at), year, monthIdx, day) : false))
    .sort((a, b) => (b.updated_at || '').localeCompare(a.updated_at || ''));
  const hasSnaps = daySnaps.length > 0;
  // month DayCarousel removed

  return (
    <div className="space-y-8">
      <div className="text-sm"><a href="/" className="text-gray-600 hover:underline">← Back</a></div>
      <header className="flex items-end justify-between gap-4">
        <h1 className="text-xl font-semibold">{date}</h1>
        <div className="text-xs text-gray-500">{daySnaps.length} snap{daySnaps.length > 1 ? 's' : ''}</div>
      </header>

      {/* Month carousel removed */}

      {/* Apple cards carousel with uploaded snaps */}
      {hasSnaps ? (
        <section className="mt-8">
          <Carousel
            items={daySnaps.map((s, index) => (
              <Card
                key={s.url}
                index={index}
                card={{
                  src: s.url,
                  title: s.name || `Snap ${index + 1}`,
                  category: date,
                  content: (
                    <div className="py-6 text-sm text-gray-600">
                      <a href={s.url} target="_blank" rel="noopener noreferrer" className="underline">
                        Open original
                      </a>
                    </div>
                  ),
                }}
              />
            ))}
          />
        </section>
      ) : (
        <div className="rounded-md border bg-white p-6 text-sm text-gray-600">No snaps for this date.</div>
      )}
    </div>
  );
}
