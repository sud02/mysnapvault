import { list } from '@vercel/blob';

type BlobSummary = {
  pathname: string;
  url: string;
  uploadedAt?: string | null;
};

export type Snap = { name: string; url: string; updated_at?: string | null };

export async function listSnaps(): Promise<Snap[]> {
  try {
    const { blobs } = await list();
    const files: BlobSummary[] = (blobs ?? []) as BlobSummary[];
    files.sort((a, b) => (b.uploadedAt || '').localeCompare(a.uploadedAt || ''));
    return files.map((blob) => ({ name: blob.pathname, url: blob.url, updated_at: blob.uploadedAt || null }));
  } catch {
    return [];
  }
}
