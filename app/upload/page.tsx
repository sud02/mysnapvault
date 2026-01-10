'use client';

import { useState, useRef } from 'react';

export default function UploadPage() {
  // Helper to get today's date in local timezone (YYYY-MM-DD)
  const getTodayLocal = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const [secret, setSecret] = useState('');
  const [selectedDate, setSelectedDate] = useState(() => {
    // Default to today's date
    return getTodayLocal();
  });
  const [maxDate] = useState(() => getTodayLocal()); // Set max date once on mount
  const [status, setStatus] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const file = fileRef.current?.files?.[0];
    if (!file) {
      setStatus('Select a file');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setStatus('File too large (max 10 MB)');
      return;
    }
    setUploading(true);
    setStatus(null);
    const fd = new FormData();
    fd.append('file', file);
    fd.append('date', selectedDate); // Add selected date to form data
    try {
      const res = await fetch('/api/upload-snap', {
        method: 'POST',
        headers: { 'x-upload-secret': secret },
        body: fd,
      });
      const json = await res.json().catch(() => null);
      if (!res.ok) {
        setStatus(json?.error || 'Upload failed');
      } else {
        setStatus('Uploaded');
        fileRef.current && (fileRef.current.value = '');
      }
    } catch {
      setStatus('Network error');
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Upload</h1>
      <form onSubmit={onSubmit} className="space-y-4 max-w-md">
        <div className="space-y-2">
          <label className="block text-sm font-medium">Date</label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            max={maxDate}
            min="2020-01-01"
            className="w-full rounded-md border px-3 py-2"
            required
          />
          <p className="text-xs text-gray-500">You can select today or any date in the past</p>
        </div>
        <div className="space-y-2">
          <label className="block text-sm font-medium">Upload Secret</label>
          <input
            type="password"
            value={secret}
            onChange={(e) => setSecret(e.target.value)}
            className="w-full rounded-md border px-3 py-2"
            placeholder="Enter secret"
            required
          />
        </div>
        <div className="space-y-2">
          <label className="block text-sm font-medium">Image</label>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="w-full rounded-md border px-3 py-2"
            required
          />
        </div>
        <button
          type="submit"
          disabled={uploading || !secret}
          className="rounded-md bg-black px-4 py-2 text-white disabled:opacity-50"
        >
          {uploading ? 'Uploading…' : 'Upload'}
        </button>
        {status && <div className="text-sm text-gray-700">{status}</div>}
      </form>
    </div>
  );
}
