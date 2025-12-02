'use client';

import { useState } from 'react';

type Visit = {
  ip: string;
  path: string;
  userAgent: string;
  timestamp: string;
};

export default function AnalyticsPage() {
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [visits, setVisits] = useState<Visit[]>([]);
  const [total, setTotal] = useState<number | null>(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ admin: '1', password });
      const res = await fetch(`/api/track?${params.toString()}`);
      if (!res.ok) {
        throw new Error('Unauthorized or failed to load');
      }
      const data = await res.json();
      setTotal(typeof data.total === 'number' ? data.total : null);
      setVisits(Array.isArray(data.visits) ? data.visits : []);
    } catch (e: any) {
      setError(e?.message || 'Failed to load');
      setTotal(null);
      setVisits([]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Analytics</h1>
      <div className="flex items-center gap-2">
        <input
          type="password"
          className="border border-gray-300 rounded px-2 py-1 text-sm"
          placeholder="Admin password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button
          onClick={load}
          disabled={loading || !password}
          className="px-3 py-1 rounded bg-gray-900 text-white text-sm disabled:opacity-50"
        >
          {loading ? 'Loading…' : 'Load stats'}
        </button>
      </div>
      {error && <p className="text-sm text-red-500">{error}</p>}
      {typeof total === 'number' && (
        <p className="text-sm text-gray-700">Total visits: {total}</p>
      )}
      {visits.length > 0 && (
        <div className="overflow-x-auto text-xs">
          <table className="min-w-full border border-gray-200 text-left">
            <thead className="bg-gray-50">
              <tr>
                <th className="border-b px-2 py-1">Time</th>
                <th className="border-b px-2 py-1">IP</th>
                <th className="border-b px-2 py-1">Path</th>
                <th className="border-b px-2 py-1">User Agent</th>
              </tr>
            </thead>
            <tbody>
              {visits
                .slice()
                .reverse()
                .map((v, idx) => (
                  <tr key={idx} className="odd:bg-white even:bg-gray-50">
                    <td className="border-b px-2 py-1 whitespace-nowrap">
                      {new Date(v.timestamp).toLocaleString()}
                    </td>
                    <td className="border-b px-2 py-1 whitespace-nowrap">{v.ip}</td>
                    <td className="border-b px-2 py-1 whitespace-nowrap">{v.path}</td>
                    <td className="border-b px-2 py-1">{v.userAgent}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
