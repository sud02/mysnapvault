"use client";
import React, { useEffect, useMemo, useState } from 'react';
import { Carousel, Card } from '@/components/ui/apple-cards-carousel';

export type DayItem = { date: string; day: number; has: boolean; preview?: string };

export default function MonthAppleCarousel({
  days,
  initialIndex,
}: {
  days: DayItem[];
  initialIndex: number;
}) {
  const [active, setActive] = useState(initialIndex);

  const items = useMemo(
    () =>
      days.map((d, index) => (
        <Card
          key={d.date}
          index={index}
          layout
          card={{
            src: d.preview,
            title: String(d.day).padStart(2, '0'),
            category: d.date,
            content: <div className="py-6 text-sm text-gray-600">No snaps for this day</div>,
          }}
        />
      )),
    [days]
  );

  const onActiveIndexChange = (idx: number) => {
    setActive(idx);
    if (days[idx]) {
      const url = `/day/${days[idx].date}`;
      // Smooth URL update without navigation
      window.history.replaceState(null, '', url);
    }
  };

  return (
    <section className="space-y-4">
      <header className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">{days[active]?.date}</h2>
      </header>
      <div className="relative">
        <Carousel
          items={items}
          initialIndex={initialIndex}
          onActiveIndexChange={onActiveIndexChange}
          disableInitialAnimation
        />
      </div>
    </section>
  );
}
