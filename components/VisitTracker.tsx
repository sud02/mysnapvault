'use client';

import { useEffect } from 'react';

export function VisitTracker() {
  useEffect(() => {
    let cancelled = false;

    async function sendTrack(path: string, lat?: number, lon?: number) {
      try {
        const params = new URLSearchParams({ path });
        if (typeof lat === 'number' && typeof lon === 'number') {
          params.set('lat', String(lat));
          params.set('lon', String(lon));
        }
        const res = await fetch(`/api/track?${params.toString()}`);
        if (!res.ok) throw new Error('Failed to track');
        await res.json();
      } catch {
        if (!cancelled) {
          // ignore tracking errors
        }
      }
    }

    const path = window.location.pathname || '/';

    if (!('geolocation' in navigator)) {
      void sendTrack(path);
    } else {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          if (cancelled) return;
          void sendTrack(path, pos.coords.latitude, pos.coords.longitude);
        },
        () => {
          if (cancelled) return;
          void sendTrack(path);
        },
        { enableHighAccuracy: true, timeout: 10000 }
      );
    }

    return () => {
      cancelled = true;
    };
  }, []);

  return null;
}
