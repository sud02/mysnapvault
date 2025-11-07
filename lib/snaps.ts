import { BUCKET, getSupabaseAdmin } from './supabaseServer';

export type Snap = { name: string; url: string; updated_at?: string | null };

export async function listSnaps(): Promise<Snap[]> {
  try {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase.storage.from(BUCKET).list('', { limit: 1000 });
    if (error) throw new Error(error.message);
    const files = (data || []) as any[];
    files.sort((a, b) => (b.updated_at || '').localeCompare(a.updated_at || ''));
    return files.map((f: any) => {
      const { data: pub } = supabase.storage.from(BUCKET).getPublicUrl(f.name);
      return { name: f.name, url: pub.publicUrl, updated_at: f.updated_at || null };
    });
  } catch {
    return [];
  }
}
