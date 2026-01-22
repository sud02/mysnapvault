'use client';

import { useEffect } from 'react';

export function VisitTracker() {
  useEffect(() => {
    let cancelled = false;

    async function sendTrack(path: string) {
      try {
        const params = new URLSearchParams({ path });
        const res = await fetch(`/api/track?${params.toString()}`);
        if (!res.ok) throw new Error('Failed to track');
        await res.json();
      } catch {
        // Ignore tracking errors
      }
    }

    const path = window.location.pathname || '/';
    void sendTrack(path);

    return () => {
      cancelled = true;
    };
  }, []);

  return null;
}
