"use client";
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
    if (carouselRef.current) {
      const cardWidth = isMobile() ? 230 : 384; // (md:w-96)
      const gap = isMobile() ? 4 : 8;
      const scrollPosition = (cardWidth + gap) * (index + 1);
      carouselRef.current.scrollTo({
        left: scrollPosition,
        behavior: "smooth",
      });
      setCurrentIndex(index);
    }
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
          className="flex w-full overflow-x-scroll overscroll-x-auto scroll-smooth py-10 [scrollbar-width:none] md:py-20"
          ref={carouselRef}
          onScroll={() => {
            checkScrollability();
            const idx = computeActiveIndex();
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
        <div className="mr-10 flex justify-end gap-2">
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
              className="fixed inset-0 h-full w-full bg-white/70 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              ref={containerRef}
              layoutId={layout ? `card-${card.title}` : undefined}
              className="relative z-[60] mx-auto my-10 h-fit max-w-5xl rounded-3xl bg-white p-4 font-sans md:p-10 dark:bg-neutral-900"
            >
              <button
                className="sticky top-4 right-0 ml-auto flex h-8 w-8 items-center justify-center rounded-full bg-black dark:bg-white"
                onClick={handleClose}
              >
                <IconX className="h-6 w-6 text-neutral-100 dark:text-neutral-900" />
              </button>
              <motion.p
                layoutId={layout ? `category-${card.title}` : undefined}
                className="text-base font-medium text-black dark:text-white"
              >
                {card.category}
              </motion.p>
              <motion.p
                layoutId={layout ? `title-${card.title}` : undefined}
                className="mt-4 text-2xl font-semibold text-neutral-700 md:text-5xl dark:text-white"
              >
                {card.title}
              </motion.p>
              <div className="py-10">{card.content}</div>
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
        <div className="relative z-40 p-8">
          <motion.p
            layoutId={layout ? `category-${card.category}` : undefined}
            className="text-left font-sans text-sm font-medium text-gray-700 md:text-base"
          >
            {card.category}
          </motion.p>
          <motion.p
            layoutId={layout ? `title-${card.title}` : undefined}
            className="mt-2 max-w-xs text-left font-sans text-xl font-semibold [text-wrap:balance] text-gray-900 md:text-3xl"
          >
            {card.title}
          </motion.p>
        </div>
        {card.src ? (
          <BlurImage
            src={card.src}
            alt={card.title}
            fill
            onLoad={(e) => {
              const img = e.currentTarget as HTMLImageElement;
              if (img && img.naturalWidth && img.naturalHeight) {
                setIsLandscape(img.naturalWidth > img.naturalHeight);
              }
            }}
            className={cn(
              "absolute inset-0 z-10 h-full w-full bg-white",
              isLandscape ? "object-cover scale-110" : "object-contain",
            )}
          />
        ) : (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-gray-100 text-gray-600 text-sm">
            not today
          </div>
        )}
      </motion.button>
    </>
  );
};

type BlurImageProps = React.ImgHTMLAttributes<HTMLImageElement> & {
  fill?: boolean;
};

export const BlurImage = ({
  height,
  width,
  src,
  className,
  alt,
  fill: _fill,
  onLoad: onLoadProp,
  ...rest
}: BlurImageProps) => {
  const [isLoading, setLoading] = useState(true);
  const handleLoad = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    try {
      onLoadProp?.(e);
    } finally {
      setLoading(false);
    }
  };
  return (
    <img
      className={cn(
        "transition duration-300",
        isLoading ? "blur-sm" : "blur-0",
        className,
      )}
      onLoad={handleLoad}
      src={src as string}
      width={width as any}
      height={height as any}
      alt={alt ? (alt as string) : "Background of a beautiful view"}
      {...rest}
    />
  );
};
