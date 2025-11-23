"use client";

import Image from 'next/image';
import { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { IconArrowNarrowLeft, IconArrowNarrowRight, IconX } from '@tabler/icons-react';
import type { Snap } from '@/lib/snaps';
import { useOutsideClick } from '@/hooks/use-outside-click';

const layoutClasses = ['aspect-[4/5]', 'aspect-square', 'aspect-[3/2]', 'aspect-[3/4]'];

type DayGalleryProps = {
  snaps: Snap[];
};

export default function DayGallery({ snaps }: DayGalleryProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  const hasMultiple = snaps.length > 1;

  const orderedSnaps = useMemo(() => snaps, [snaps]);

  const openAt = (index: number) => {
    setActiveIndex(index);
  };

  const close = () => {
    setActiveIndex(null);
  };

  useOutsideClick(modalRef, close);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        close();
      }
      if (event.key === 'ArrowLeft') {
        showPrev();
      }
      if (event.key === 'ArrowRight') {
        showNext();
      }
    };

    if (activeIndex !== null) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', onKeyDown);
    } else {
      document.body.style.overflow = 'auto';
    }

    return () => {
      window.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = 'auto';
    };
  }, [activeIndex]);

  const showPrev = () => {
    setActiveIndex((prev) => {
      if (prev === null || orderedSnaps.length <= 1) return prev;
      return (prev - 1 + orderedSnaps.length) % orderedSnaps.length;
    });
  };

  const showNext = () => {
    setActiveIndex((prev) => {
      if (prev === null || orderedSnaps.length <= 1) return prev;
      return (prev + 1) % orderedSnaps.length;
    });
  };

  const activeSnap = activeIndex !== null ? orderedSnaps[activeIndex] : null;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {orderedSnaps.map((snap, index) => (
          <button
            type="button"
            key={snap.url}
            onClick={() => openAt(index)}
            className={`group relative overflow-hidden rounded-2xl bg-black/5 transition-transform hover:-translate-y-1 hover:shadow-lg ${layoutClasses[index % layoutClasses.length]}`}
          >
            <Image
              src={snap.url}
              alt={snap.name || `Photo ${index + 1}`}
              fill
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, (max-width: 1280px) 40vw, 25vw"
              priority={index < 3}
            />
          </button>
        ))}
      </div>

      <AnimatePresence>
        {activeSnap && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              ref={modalRef}
              className="relative mx-4 flex max-h-[90vh] max-w-5xl flex-col items-center gap-4"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 12 }}
            >
              <button
                type="button"
                onClick={close}
                className="absolute -top-12 right-0 flex h-9 w-9 items-center justify-center rounded-full bg-black text-white shadow-lg"
                aria-label="Close"
              >
                <IconX className="h-5 w-5" />
              </button>
              <div className="relative flex items-center justify-center">
                <Image
                  src={activeSnap.url}
                  alt={activeSnap.name || 'Selected photo'}
                  width={1600}
                  height={900}
                  className="max-h-[80vh] max-w-full rounded-3xl object-contain"
                  sizes="(max-width: 768px) 90vw, (max-width: 1280px) 70vw, 960px"
                  priority
                />
                {hasMultiple && (
                  <>
                    <button
                      type="button"
                      onClick={showPrev}
                      className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-white/80 p-2 text-gray-800 shadow-md backdrop-blur"
                      aria-label="Previous photo"
                    >
                      <IconArrowNarrowLeft className="h-6 w-6" />
                    </button>
                    <button
                      type="button"
                      onClick={showNext}
                      className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-white/80 p-2 text-gray-800 shadow-md backdrop-blur"
                      aria-label="Next photo"
                    >
                      <IconArrowNarrowRight className="h-6 w-6" />
                    </button>
                  </>
                )}
              </div>
              {hasMultiple && (
                <div className="flex items-center justify-center gap-2">
                  {orderedSnaps.map((snap, idx) => (
                    <button
                      key={snap.url}
                      type="button"
                      onClick={() => setActiveIndex(idx)}
                      className={`h-2.5 w-2.5 rounded-full border border-white/40 transition ${
                        idx === activeIndex ? 'bg-white' : 'bg-white/30'
                      }`}
                      aria-label={`Go to photo ${idx + 1}`}
                    />
                  ))}
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
