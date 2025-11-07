'use client';

import { useMemo, useState } from 'react';
import type { Snap } from '@/lib/snaps';

type Props = { snaps: Snap[] };

export default function GalleryView({ snaps }: Props) {
  const [active, setActive] = useState(0);
  const [mode, setMode] = useState<'grid' | 'slider'>('grid');

  const years = useMemo(() => {
    const ys = snaps
      .map((s) => (s.updated_at ? new Date(s.updated_at).getFullYear() : null))
      .filter((x): x is number => !!x);
    const now = new Date().getFullYear();
    return { min: ys.length ? Math.min(...ys) : now, max: ys.length ? Math.max(...ys) : now };
  }, [snaps]);

  const onPick = (i: number) => {
    setActive(i);
    setMode('slider');
  };

  return (
    <div className="relative">
      <div className="flex flex-col lg:flex-row lg:items-start gap-8 lg:gap-16">
        {/* Grid panel */}
        <section className={`lg:w-5/12 ${mode === 'slider' ? 'hidden lg:block' : ''}`} aria-label="Grid">
          <div className="grid grid-cols-3 md:grid-cols-4 gap-12">
            {snaps.map((s, i) => (
              <div key={s.url} className="flex flex-col gap-2">
                <span className="text-[10px] md:text-[11px] leading-none font-serif text-black/70">{i + 1}</span>
                <button
                  type="button"
                  onClick={() => onPick(i)}
                  className="relative aspect-square overflow-hidden rounded-[6px]"
                  aria-label={`Open ${s.name || 'photo'} ${i + 1}`}
                >
                  <img
                    src={s.url}
                    alt={s.name}
                    className="absolute inset-0 h-full w-full object-cover filter grayscale"
                    loading="lazy"
                  />
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* Slider panel */}
        <section className={`lg:w-7/12 lg:border-l lg:border-gray-200 lg:pl-12 ${mode === 'grid' ? 'hidden lg:block' : ''}`} aria-label="Slider">
          <div className="flex flex-col items-center justify-center w-full">
            <div className="w-full max-w-[880px] aspect-[3/2] rounded-md overflow-hidden bg-white border border-gray-200 shadow-sm">
              {snaps[active] ? (
                <img src={snaps[active].url} alt={snaps[active].name} className="h-full w-full object-cover" />
              ) : null}
            </div>
            <div className="mt-12 flex items-center justify-center gap-6 text-xl text-gray-900">
              <span className="font-serif">{years.min}</span>
              <span className="inline-block h-px w-56 bg-gray-900" />
              <span className="font-serif">{years.max}</span>
            </div>
          </div>
        </section>
      </div>

      {/* Toggle */}
      <div className="fixed z-20 bottom-6 left-1/2 -translate-x-1/2">
        <div className="inline-flex items-center rounded-full bg-gray-900 text-white p-1 shadow-lg border border-black/10">
          <button
            type="button"
            onClick={() => setMode('grid')}
            className={`px-3 py-1 text-sm rounded-full transition-colors ${
              mode === 'grid' ? 'bg-white text-gray-900' : 'bg-transparent text-white'
            }`}
          >
            Grid
          </button>
          <button
            type="button"
            onClick={() => setMode('slider')}
            className={`px-3 py-1 text-sm rounded-full transition-colors ${
              mode === 'slider' ? 'bg-white text-gray-900' : 'bg-transparent text-white'
            }`}
          >
            Slider
          </button>
        </div>
      </div>
    </div>
  );
}
