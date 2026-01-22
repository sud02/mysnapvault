import { createClient } from '@supabase/supabase-js';

export const BUCKET = process.env.SNAPS_BUCKET || 'snaps';

export function getSupabaseAdmin() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  // Better error messages for debugging
  if (!url) {
    console.error('❌ SUPABASE_URL is not set in environment variables');
    throw new Error('SUPABASE_URL environment variable is missing. Please set it in Vercel Dashboard → Settings → Environment Variables');
  }
  
  if (!key) {
    console.error('❌ SUPABASE_SERVICE_ROLE_KEY is not set in environment variables');
    throw new Error('SUPABASE_SERVICE_ROLE_KEY environment variable is missing. Please set it in Vercel Dashboard → Settings → Environment Variables');
  }
  
  console.log(`✅ Supabase configured: URL=${url.substring(0, 30)}..., BUCKET=${BUCKET}`);
  
  return createClient(url, key, { auth: { persistSession: false } });
}
