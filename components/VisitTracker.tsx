'use client';

import { useEffect } from 'react';

export function VisitTracker() {
  useEffect(() => {
    let cancelled = false;

    async function track() {
      try {
        const path = window.location.pathname || '/';
        const res = await fetch(`/api/track?path=${encodeURIComponent(path)}`);
        if (!res.ok) throw new Error('Failed to track');
        await res.json();
      } catch {
        // ignore errors on tracking
        if (!cancelled) {
          // no-op
        }
      }
    }

    track();

    return () => {
      cancelled = true;
    };
  }, []);

  return null;
}
