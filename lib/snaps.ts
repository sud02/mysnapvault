import { getSupabaseAdmin, BUCKET } from './supabaseServer';

export type Snap = { name: string; url: string; updated_at?: string | null };

export async function listSnaps(): Promise<Snap[]> {
  try {
    const supabase = getSupabaseAdmin();
    const { data: files, error } = await supabase.storage
      .from(BUCKET)
      .list('', {
        sortBy: { column: 'created_at', order: 'desc' },
      });

    if (error) {
      console.error('Error listing snaps:', error);
      return [];
    }

    if (!files || files.length === 0) return [];

    // Get public URLs for each file
    const snaps = files
      .filter((file) => file.name && file.name !== '.emptyFolderPlaceholder')
      .map((file) => {
        const { data } = supabase.storage.from(BUCKET).getPublicUrl(file.name);
        return {
          name: file.name,
          url: data.publicUrl,
          updated_at: file.created_at || null,
        };
      });

    return snaps;
  } catch (error) {
    console.error('Error in listSnaps:', error);
    return [];
  }
}
