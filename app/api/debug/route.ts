import { NextResponse } from 'next/server';
import { getSupabaseAdmin, BUCKET } from '@/lib/supabaseServer';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  const checks: Record<string, any> = {
    bucketName: BUCKET,
    supabaseUrl: process.env.SUPABASE_URL ? `✅ Set (${process.env.SUPABASE_URL.substring(0, 30)}...)` : '❌ NOT SET',
    supabaseKey: process.env.SUPABASE_SERVICE_ROLE_KEY ? `✅ Set (${process.env.SUPABASE_SERVICE_ROLE_KEY.substring(0, 20)}...)` : '❌ NOT SET',
    bucketEnv: process.env.SNAPS_BUCKET || '⚠️ Using default: snaps (SNAPS_BUCKET not set!)',
    uploadSecret: process.env.UPLOAD_SECRET ? '✅ Set' : '❌ NOT SET',
    nodeEnv: process.env.NODE_ENV || 'not set',
    vercelEnv: process.env.VERCEL_ENV || 'not set',
  };

  try {
    const supabase = getSupabaseAdmin();
    
    // Try to list files
    const { data: files, error } = await supabase.storage
      .from(BUCKET)
      .list('', { limit: 5 });

    if (error) {
      checks.bucketAccess = `❌ Error: ${error.message}`;
      checks.errorDetails = error;
    } else {
      checks.bucketAccess = `✅ Success - Found ${files?.length || 0} files`;
      checks.sampleFiles = files?.slice(0, 3).map(f => ({
        name: f.name,
        created: f.created_at,
      }));
    }

    // Try to get a public URL (if files exist)
    if (files && files.length > 0) {
      const testFile = files[0].name;
      const { data: urlData } = supabase.storage.from(BUCKET).getPublicUrl(testFile);
      checks.sampleUrl = urlData.publicUrl;
    }

  } catch (e: any) {
    checks.error = e.message;
  }

  return NextResponse.json(checks, { status: 200 });
}

