import { NextResponse } from 'next/server';
import { getSupabaseAdmin, BUCKET } from '@/lib/supabaseServer';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  const secretHeader = request.headers.get('x-upload-secret') || '';
  const expected = process.env.UPLOAD_SECRET || '';
  if (!expected || secretHeader !== expected) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const form = await request.formData();
  const file = form.get('file') as File | null;
  const selectedDate = form.get('date') as string | null; // Get the selected date
  
  if (!file) {
    return NextResponse.json({ error: 'Missing file' }, { status: 400 });
  }
  if (file.size > 10 * 1024 * 1024) {
    return NextResponse.json({ error: 'File too large (max 10 MB)' }, { status: 413 });
  }
  
  const ext = file.name.includes('.') ? file.name.split('.').pop() : '';
  const safeExt = (ext || '').toLowerCase().replace(/[^a-z0-9]/g, '');
  
  // Use selected date or current date
  let uploadDate: Date;
  if (selectedDate) {
    // Parse the date string (YYYY-MM-DD) and set to start of day in local timezone
    const [year, month, day] = selectedDate.split('-').map(Number);
    uploadDate = new Date(year, month - 1, day, 0, 0, 0, 0);
    console.log(`📅 Selected date: ${selectedDate} → Timestamp: ${uploadDate.getTime()} (${uploadDate.toISOString()})`);
  } else {
    uploadDate = new Date();
    console.log(`📅 Using current date: ${uploadDate.toISOString()}`);
  }
  
  const ts = uploadDate.getTime();
  const rand = Math.random().toString(36).slice(2, 8);
  const fileName = `${ts}-${rand}${safeExt ? '.' + safeExt : ''}`;
  
  console.log(`📦 Generated filename: ${fileName}`);
  
  try {
    const supabase = getSupabaseAdmin();
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from(BUCKET)
      .upload(fileName, buffer, {
        contentType: file.type || 'application/octet-stream',
        cacheControl: '2592000', // 30 days
        upsert: false,
      });

    if (error) {
      console.error('Supabase upload error:', error);
      return NextResponse.json({ error: error.message || 'Upload failed' }, { status: 500 });
    }

    // Get public URL
    const { data: urlData } = supabase.storage.from(BUCKET).getPublicUrl(fileName);

    return NextResponse.json({ 
      path: fileName, 
      url: urlData.publicUrl, 
      uploadedAt: uploadDate.toISOString() 
    }, { status: 200 });
  } catch (e: any) {
    console.error('Upload error:', e);
    return NextResponse.json({ error: e?.message || 'Server error' }, { status: 500 });
  }
}
