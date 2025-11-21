import { list } from '@vercel/blob';

export type Snap = { name: string; url: string; updated_at?: string | null };

export async function listSnaps(): Promise<Snap[]> {
  try {
    const { blobs } = await list();
    const files = blobs ?? [];
    files.sort((a, b) => {
      const aTime = a.uploadedAt ? a.uploadedAt.getTime() : 0;
      const bTime = b.uploadedAt ? b.uploadedAt.getTime() : 0;
      return bTime - aTime;
    });
    return files.map((blob) => ({ name: blob.pathname, url: blob.url, updated_at: blob.uploadedAt?.toISOString() ?? null }));
  } catch {
    return [];
  }
}
