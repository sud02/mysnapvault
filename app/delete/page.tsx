'use client';

import Image from 'next/image';
import { useEffect, useMemo, useState, useTransition } from 'react';
import type { Snap } from '@/lib/snaps';

type SnapWithSelection = Snap & { deleting?: boolean };

type FetchSnapsResult = { snaps: Snap[] };

type DeleteResponse = { ok?: boolean; error?: string };

async function fetchSnaps(): Promise<Snap[]> {
  const res = await fetch('/api/snaps', { cache: 'no-store' });
  if (!res.ok) return [];
  const json = (await res.json().catch(() => null)) as FetchSnapsResult | null;
  return json?.snaps ?? [];
}

export default function DeletePage() {
  const [secret, setSecret] = useState('');
  const [snaps, setSnaps] = useState<SnapWithSelection[]>([]);
  const [status, setStatus] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    startTransition(() => {
      fetchSnaps().then((data) => setSnaps(data));
    });
  }, []);

  const hasSnaps = snaps.length > 0;

  const sortedSnaps = useMemo(() => {
    return [...snaps].sort((a, b) => {
      const aTime = a.updated_at ? new Date(a.updated_at).getTime() : 0;
      const bTime = b.updated_at ? new Date(b.updated_at).getTime() : 0;
      return bTime - aTime;
    });
  }, [snaps]);

  async function refreshSnaps() {
    setRefreshing(true);
    const data = await fetchSnaps();
    setSnaps(data);
    setRefreshing(false);
  }

  async function handleDelete(path: string) {
    if (!secret) {
      setStatus('Enter the secret first.');
      return;
    }
    setStatus(null);
    setSnaps((prev) => prev.map((s) => (s.name === path ? { ...s, deleting: true } : s)));
    try {
      const res = await fetch('/api/delete-snap', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-upload-secret': secret,
        },
        body: JSON.stringify({ path }),
      });
      const json = (await res.json().catch(() => null)) as DeleteResponse | null;
      if (!res.ok) {
        setStatus(json?.error || 'Delete failed');
        setSnaps((prev) => prev.map((s) => (s.name === path ? { ...s, deleting: false } : s)));
      } else {
        setStatus('Deleted');
        await refreshSnaps();
      }
    } catch {
      setStatus('Network error');
      setSnaps((prev) => prev.map((s) => (s.name === path ? { ...s, deleting: false } : s)));
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Delete Snap</h1>
      <p className="text-sm text-gray-600">
        Enter the same secret used for uploads to remove an uploaded snap.
      </p>
      <div className="space-y-2 max-w-sm">
        <label className="block text-sm font-medium">Secret</label>
        <input
          type="password"
          value={secret}
          onChange={(e) => setSecret(e.target.value)}
          className="w-full rounded-md border px-3 py-2"
          placeholder="Upload secret"
        />
      </div>
      {status && <div className="text-sm text-gray-700">{status}</div>}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">
          {hasSnaps ? `${sortedSnaps.length} snap${sortedSnaps.length === 1 ? '' : 's'} found` : 'No snaps loaded yet'}
        </p>
        <button
          type="button"
          onClick={refreshSnaps}
          className="rounded-md border px-3 py-1 text-sm"
          disabled={refreshing || isPending}
        >
          {refreshing ? 'Refreshing…' : 'Refresh list'}
        </button>
      </div>
      <div className="space-y-3">
        {sortedSnaps.length === 0 && !isPending ? (
          <div className="text-sm text-gray-500">No snaps found.</div>
        ) : (
          sortedSnaps.map((snap) => {
            const displayDate = snap.updated_at
              ? (() => {
                  const parsed = new Date(snap.updated_at);
                  return Number.isNaN(parsed.getTime()) ? 'Unknown' : parsed.toLocaleString();
                })()
              : 'Unknown';

            return (
              <div
                key={snap.name}
                className="flex items-center justify-between rounded-md border px-3 py-2 shadow-sm"
              >
                <div className="flex items-center gap-3">
                  <div className="relative h-12 w-12 overflow-hidden rounded">
                    <Image
                      src={snap.url}
                      alt=""
                      fill
                      sizes="48px"
                      className="object-cover"
                    />
                  </div>
                  <div className="text-sm">
                    <div className="font-medium break-all">{snap.name}</div>
                    <div className="text-xs text-gray-500">Uploaded: {displayDate}</div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleDelete(snap.name)}
                  disabled={snap.deleting || refreshing}
                  className="rounded-md bg-red-600 px-3 py-1 text-sm text-white disabled:opacity-50"
                >
                  {snap.deleting ? 'Deleting…' : 'Delete'}
                </button>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
