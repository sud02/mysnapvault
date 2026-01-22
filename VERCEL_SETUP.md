# Vercel Environment Variables Setup

## Required Environment Variables

Make sure these are set in your Vercel project:

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project
3. Go to **Settings** → **Environment Variables**
4. Add these variables:

### Required Variables:

```
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
SNAPS_BUCKET=Snaps
UPLOAD_SECRET=your_upload_secret_here
```

### Important Notes:

1. **SNAPS_BUCKET**: Must match your Supabase bucket name EXACTLY (case-sensitive)
   - If your bucket is named "Snaps" (capital S), use `SNAPS_BUCKET=Snaps`
   - If your bucket is named "snaps" (lowercase), use `SNAPS_BUCKET=snaps`

2. **SUPABASE_URL**: Your full Supabase project URL
   - Format: `https://xxxxxxxxxxxxx.supabase.co`

3. **SUPABASE_SERVICE_ROLE_KEY**: Your service role key (starts with `eyJh...`)
   - Get it from: Supabase Dashboard → Settings → API → Service Role Key

4. **UPLOAD_SECRET**: Your upload secret (can be any string)
   - Example: `Sud@123`

## After Adding Variables:

1. **Redeploy** your project:
   - Go to **Deployments** tab
   - Click the **"..."** menu on latest deployment
   - Click **"Redeploy"**

2. **Clear browser cache**:
   - Hard refresh: `Ctrl+Shift+R` (Windows) or `Cmd+Shift+R` (Mac)

## Troubleshooting:

### Images Not Loading?

1. **Check bucket name**: 
   - Go to Supabase Dashboard → Storage
   - Check the exact bucket name (case-sensitive)
   - Make sure `SNAPS_BUCKET` in Vercel matches exactly

2. **Check bucket is public**:
   - In Supabase Dashboard → Storage → Your bucket
   - Make sure "Public bucket" is enabled ✅

3. **Check bucket policies**:
   - Go to Storage → Your bucket → Policies
   - Should have a policy allowing public SELECT access

4. **Check Vercel logs**:
   - Go to Vercel Dashboard → Your project → Logs
   - Look for errors about Supabase or bucket access

### Common Errors:

- **"Bucket not found"**: Bucket name mismatch (check case)
- **"Unauthorized"**: Service role key is wrong or missing
- **"Images not loading"**: Bucket not public or CORS issue

## Verify Setup:

1. Check Vercel environment variables are set
2. Check Supabase bucket name matches exactly
3. Check bucket is public
4. Redeploy after making changes
5. Check browser console for errors

