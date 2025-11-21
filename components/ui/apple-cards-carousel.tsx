"use client";
import Image from "next/image";
import React, {
  useEffect,
  useRef,
  useState,
  createContext,
  useContext,
} from "react";
import {
  IconArrowNarrowLeft,
  IconArrowNarrowRight,
  IconX,
} from "@tabler/icons-react";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "motion/react";
// no next/image to avoid remotePatterns requirements for external hosts
import { useOutsideClick } from "@/hooks/use-outside-click";

interface CarouselProps {
  items: JSX.Element[];
  initialScroll?: number;
  initialIndex?: number;
  onActiveIndexChange?: (index: number) => void;
}

type CardData = {
  src?: string;
  title: string;
  category: string;
  content: React.ReactNode;
};

export const CarouselContext = createContext<{
  onCardClose: (index: number) => void;
  currentIndex: number;
}>({
  onCardClose: () => {},
  currentIndex: 0,
});

export const Carousel = ({ items, initialScroll = 0, initialIndex, onActiveIndexChange }: CarouselProps) => {
  const carouselRef = React.useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = React.useState(false);
  const [canScrollRight, setCanScrollRight] = React.useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollTimeout = React.useRef<number | null>(null);
  const suppressSnapUntil = React.useRef<number>(0);

  function centerToIndex(index: number, behavior: ScrollBehavior = 'smooth') {
    const el = carouselRef.current;
    if (!el) return;
    const node = el.querySelector(`[data-card="1"][data-index="${index}"]`) as HTMLElement | null;
    if (!node) return;
    const rect = node.getBoundingClientRect();
    const elRect = el.getBoundingClientRect();
    const targetLeft = el.scrollLeft + (rect.left - elRect.left) - (el.clientWidth / 2 - rect.width / 2);
    el.scrollTo({ left: Math.max(0, targetLeft), behavior });
  }

  useEffect(() => {
    if (!carouselRef.current) return;
    const el = carouselRef.current;
    if (typeof initialIndex === 'number') {
      // Center precisely to the initial index on mount
      // Delay to ensure nodes are laid out
      setTimeout(() => centerToIndex(initialIndex, 'auto'), 0);
    } else {
      el.scrollLeft = initialScroll;
    }
    checkScrollability();
    computeActiveIndex();
  }, [initialScroll, initialIndex]);

  const checkScrollability = () => {
    if (carouselRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = carouselRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth);
    }
  };

  const computeActiveIndex = (): number => {
    const el = carouselRef.current;
    if (!el) return currentIndex;
    const center = el.scrollLeft + el.clientWidth / 2;
    const nodes = Array.from(el.querySelectorAll('[data-card="1"]')) as HTMLElement[];
    if (nodes.length === 0) return currentIndex;
    let best = 0;
    let bestDist = Number.POSITIVE_INFINITY;
    for (let i = 0; i < nodes.length; i++) {
      const n = nodes[i];
      const r = n.getBoundingClientRect();
      const elRect = el.getBoundingClientRect();
      const mid = el.scrollLeft + (r.left - elRect.left) + r.width / 2;
      const dist = Math.abs(mid - center);
      if (dist < bestDist) {
        bestDist = dist;
        best = i;
      }
    }
    if (best !== currentIndex) {
      setCurrentIndex(best);
      onActiveIndexChange?.(best);
    }
    return best;
  };

  const scrollLeft = () => {
    const next = Math.max(0, currentIndex - 1);
    centerToIndex(next, 'smooth');
  };

  const scrollRight = () => {
    const next = Math.min(items.length - 1, currentIndex + 1);
    centerToIndex(next, 'smooth');
  };

  const handleCardClose = (index: number) => {
    setCurrentIndex(index);
    suppressSnapUntil.current = Date.now() + 600;
  };

  const isMobile = () => {
    return typeof window !== "undefined" && window.innerWidth < 768;
  };

  return (
    <CarouselContext.Provider
      value={{ onCardClose: handleCardClose, currentIndex }}
    >
      <div className="relative w-full">
        <div
          className="flex w-full overflow-x-scroll overscroll-x-auto scroll-smooth py-10 [scrollbar-width:none] md:py-10"
          ref={carouselRef}
          onScroll={() => {
            checkScrollability();
            const idx = computeActiveIndex();
            if (Date.now() < suppressSnapUntil.current) {
              return;
            }
            if (scrollTimeout.current) window.clearTimeout(scrollTimeout.current);
            scrollTimeout.current = window.setTimeout(() => {
              centerToIndex(idx, 'smooth');
            }, 150);
          }}
        >
          <div className="hidden" />

          <div
            className={cn(
              "flex flex-row justify-start gap-4 pl-4",
              "mx-auto max-w-7xl",
            )}
          >
            {items.map((item, index) => (
              <motion.div
                initial={{
                  opacity: 0,
                  y: 20,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                  transition: {
                    duration: 0.5,
                    delay: 0.2 * index,
                    ease: "easeOut",
                  },
                }}
                key={"card" + index}
                data-card="1"
                data-index={index}
                className="rounded-3xl last:pr-[5%] md:last:pr-[33%]"
              >
                {item}
              </motion.div>
            ))}
          </div>
        </div>
        {/* Mobile controls: bottom-right cluster */}
        <div className="mr-10 flex justify-end gap-2 md:hidden">
          <button
            className="relative z-40 flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:opacity-50"
            onClick={scrollLeft}
            disabled={!canScrollLeft}
          >
            <IconArrowNarrowLeft className="h-6 w-6" />
          </button>
          <button
            className="relative z-40 flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:opacity-50"
            onClick={scrollRight}
            disabled={!canScrollRight}
          >
            <IconArrowNarrowRight className="h-6 w-6" />
          </button>
        </div>

        {/* Desktop controls: left/right sides of carousel */}
        <div className="hidden md:block">
          <div className="pointer-events-none absolute inset-y-0 -left-4 md:-left-6 lg:-left-10 xl:-left-16 flex items-center">
            <button
              className="pointer-events-auto relative z-40 flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:opacity-50"
              onClick={scrollLeft}
              disabled={!canScrollLeft}
            >
              <IconArrowNarrowLeft className="h-6 w-6" />
            </button>
          </div>
          <div className="pointer-events-none absolute inset-y-0 -right-4 md:-right-6 lg:-right-10 xl:-right-16 flex items-center">
            <button
              className="pointer-events-auto relative z-40 flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:opacity-50"
              onClick={scrollRight}
              disabled={!canScrollRight}
            >
              <IconArrowNarrowRight className="h-6 w-6" />
            </button>
          </div>
        </div>
      </div>
    </CarouselContext.Provider>
  );
};

export const Card = ({
  card,
  index,
  layout = false,
  href,
}: {
  card: CardData;
  index: number;
  layout?: boolean;
  href?: string;
}) => {
  const [open, setOpen] = useState(false);
  const [isLandscape, setIsLandscape] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const { onCardClose, currentIndex } = useContext(CarouselContext);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        handleClose();
      }
    }

    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open]);

  useOutsideClick(containerRef, () => handleClose());

  const handleOpen = () => {
    if (href) {
      window.location.href = href;
      return;
    }
    if (!card.src) {
      return; // placeholder card, do nothing
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    onCardClose(index);
  };

  return (
    <>
      <AnimatePresence>
        {open && (
          <div className="fixed inset-0 z-50 h-screen overflow-auto">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 h-full w-full bg-black/80 backdrop-blur-[2px]"
            />
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              ref={containerRef}
              layoutId={layout ? `card-${card.title}` : undefined}
              className="relative z-[60] mx-auto my-10 flex items-center justify-center"
            >
              <button
                className="sticky top-4 right-0 ml-auto flex h-8 w-8 items-center justify-center rounded-full bg-black"
                onClick={handleClose}
                aria-label="Close"
              >
                <IconX className="h-6 w-6 text-white" />
              </button>
              {card.src ? (
                <Image
                  src={card.src}
                  alt={card.title}
                  width={1600}
                  height={900}
                  className="max-h-[85vh] max-w-[90vw] object-contain rounded-2xl"
                  sizes="90vw"
                  priority
                />
              ) : null}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      <motion.button
        layoutId={layout ? `card-${card.title}` : undefined}
        onClick={handleOpen}
        className={cn(
          "relative z-10 flex w-56 flex-col items-start justify-start overflow-hidden rounded-3xl bg-white md:w-96 border border-gray-200 shadow-sm",
          isLandscape ? "h-96 md:h-[44rem]" : "h-80 md:h-[40rem]",
          currentIndex === index ? "ring-2 ring-[#FFCC00] shadow-[0_10px_30px_rgba(255,204,0,0.25)]" : "",
        )}
      >
        <div className="hidden" />
        <div className="hidden" />
        {card.src ? (
          <div className="absolute inset-0 z-10 h-full w-full">
            <Image
              src={card.src}
              alt={card.title}
              fill
              className="absolute inset-0 h-full w-full object-cover"
              sizes="(max-width: 768px) 70vw, (max-width: 1200px) 40vw, 400px"
              onLoad={(e) => {
                const img = e.target as HTMLImageElement;
                if (img && img.naturalWidth && img.naturalHeight) {
                  setIsLandscape(img.naturalWidth > img.naturalHeight);
                }
              }}
              priority={index < 3}
            />
          </div>
        ) : (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-gray-100 text-gray-600 text-sm">
            not today
          </div>
        )}
      </motion.button>
    </>
  );
};
