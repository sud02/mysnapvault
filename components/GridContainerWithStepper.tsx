"use client";

import React from "react";

export default function GridContainerWithStepper({ children }: { children: React.ReactNode }) {
  const [rows, setRows] = React.useState<number>(6);
  const containerRef = React.useRef<HTMLDivElement>(null);

  const clamp = (n: number) => Math.min(9, Math.max(4, n));
  const dec = () => setRows((r) => clamp(r + 1)); // more rows -> smaller tiles
  const inc = () => setRows((r) => clamp(r - 1)); // fewer rows -> bigger tiles

  return (
    <div
      ref={containerRef}
      className="relative gallery-wrap fit-viewport"
      style={{ ["--rows" as any]: String(rows) }}
    >
      <div className="pr-14 pb-14">{children}</div>
      <div className="pointer-events-none absolute bottom-3 right-3 z-20">
        <div className="inline-flex items-center rounded-full bg-white/80 backdrop-blur-sm border border-gray-200 shadow-sm pointer-events-auto">
          <button
            type="button"
            onClick={inc}
            aria-label="Increase tile size"
            className="px-3 py-1.5 text-gray-800 hover:bg-white transition-colors rounded-l-full"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 5v14" />
              <path d="M5 12h14" />
            </svg>
          </button>
          <div className="h-6 w-px bg-gray-200" />
          <button
            type="button"
            onClick={dec}
            aria-label="Decrease tile size"
            className="px-3 py-1.5 text-gray-800 hover:bg-white transition-colors rounded-r-full"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
