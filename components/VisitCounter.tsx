'use client';

import { useEffect, useState } from 'react';

export function VisitCounter() {
  const [count, setCount] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function track() {
      try {
        const path = window.location.pathname || '/';
        const res = await fetch(`/api/track?path=${encodeURIComponent(path)}`);
        if (!res.ok) throw new Error('Failed to track');
        const data = await res.json();
        if (!cancelled) {
          setCount(typeof data.total === 'number' ? data.total : null);
        }
      } catch (e) {
        if (!cancelled) setError('');
      }
    }

    track();

    return () => {
      cancelled = true;
    };
  }, []);

  if (count == null && !error) return null;

  return (
    <p className="text-xs text-center text-gray-400 mt-2">
      {typeof count === 'number' ? `${count} visits` : ''}
    </p>
  );
}
