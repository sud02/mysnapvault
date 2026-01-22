import { getSupabaseAdmin, BUCKET } from './supabaseServer';

export type Snap = { name: string; url: string; updated_at?: string | null };

export async function listSnaps(): Promise<Snap[]> {
  try {
    // Check environment variables first
    if (!process.env.SUPABASE_URL) {
      console.error('❌ CRITICAL: SUPABASE_URL is not set!');
      console.error('   → Go to Vercel Dashboard → Settings → Environment Variables');
      console.error('   → Add SUPABASE_URL=https://your-project.supabase.co');
      console.error('   → Then REDEPLOY your project');
      return [];
    }
    
    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
      console.error('❌ CRITICAL: SUPABASE_SERVICE_ROLE_KEY is not set!');
      console.error('   → Go to Vercel Dashboard → Settings → Environment Variables');
      console.error('   → Add SUPABASE_SERVICE_ROLE_KEY=your_key_here');
      console.error('   → Then REDEPLOY your project');
      return [];
    }
    
    const supabase = getSupabaseAdmin();
    console.log(`📦 Listing files from bucket: "${BUCKET}"`);
    console.log(`📦 Supabase URL: ${process.env.SUPABASE_URL.substring(0, 30)}...`);
    console.log(`📦 Bucket name from env: "${process.env.SNAPS_BUCKET || 'NOT SET (using default)'}"`);
    console.log(`📦 Bucket name used: "${BUCKET}"`);
    
    const { data: files, error } = await supabase.storage
      .from(BUCKET)
      .list('', {
        sortBy: { column: 'created_at', order: 'desc' },
      });

    if (error) {
      console.error('❌ Error listing snaps:', error);
      console.error('❌ Error details:', JSON.stringify(error, null, 2));
      
      // Specific error messages
      if (error.message?.includes('not found') || error.message?.includes('does not exist')) {
        console.error(`⚠️  Bucket "${BUCKET}" not found in Supabase!`);
        console.error(`   → Check Supabase Dashboard → Storage`);
        console.error(`   → Bucket name must match EXACTLY (case-sensitive)`);
        console.error(`   → Current bucket name: "${BUCKET}"`);
        console.error(`   → Set SNAPS_BUCKET in Vercel to match your bucket name`);
      } else if (error.message?.includes('JWT') || error.message?.includes('unauthorized')) {
        console.error(`⚠️  Authentication failed!`);
        console.error(`   → Check SUPABASE_SERVICE_ROLE_KEY in Vercel`);
        console.error(`   → Get it from: Supabase Dashboard → Settings → API → Service Role Key`);
      }
      return [];
    }

    if (!files || files.length === 0) {
      console.log('⚠️  No files found in bucket');
      return [];
    }

    console.log(`✅ Found ${files.length} file(s) in bucket`);

    // Get public URLs for each file
    const snaps = files
      .filter((file) => file.name && file.name !== '.emptyFolderPlaceholder')
      .map((file) => {
        const { data } = supabase.storage.from(BUCKET).getPublicUrl(file.name);
        
        // Extract timestamp from filename (format: timestamp-random.ext)
        let fileDate: string | null = null;
        const timestampMatch = file.name.match(/^(\d{13})-/);
        if (timestampMatch) {
          const timestamp = parseInt(timestampMatch[1], 10);
          if (!isNaN(timestamp)) {
            const date = new Date(timestamp);
            fileDate = date.toISOString();
            const year = date.getFullYear();
            const month = date.getMonth();
            const day = date.getDate();
            console.log(`📅 ${file.name} → ${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')} (${date.toLocaleDateString()})`);
          }
        }
        
        // Fallback to Supabase created_at if no timestamp in filename
        const updated_at = fileDate || file.created_at || null;
        
        return {
          name: file.name,
          url: data.publicUrl,
          updated_at: updated_at,
        };
      });

    return snaps;
  } catch (error) {
    console.error('❌ Error in listSnaps:', error);
    return [];
  }
}
