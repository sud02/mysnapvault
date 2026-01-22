# Quick Fix: Copy Environment Variables to Vercel

## Step-by-Step Instructions

### Step 1: Get Your Local Values

Your `.env.local` file has these values. Copy them exactly:

1. Open your `.env.local` file
2. Copy each value (you'll need them in Step 2)

### Step 2: Add to Vercel

1. **Go to**: [Vercel Dashboard](https://vercel.com/dashboard)
2. **Click** on your project (`mysnapvault`)
3. **Go to**: **Settings** → **Environment Variables**
4. **Click**: **"Add New"** button

### Step 3: Add Each Variable

Add these 4 variables one by one:

#### Variable 1:
- **Key**: `SUPABASE_URL`
- **Value**: Copy from your `.env.local` (starts with `https://`)
- **Environment**: Select **Production**, **Preview**, and **Development** ✅
- Click **Save**

#### Variable 2:
- **Key**: `SUPABASE_SERVICE_ROLE_KEY`
- **Value**: Copy from your `.env.local` (long string starting with `eyJh...`)
- **Environment**: Select **Production**, **Preview**, and **Development** ✅
- Click **Save**

#### Variable 3:
- **Key**: `SNAPS_BUCKET`
- **Value**: Copy from your `.env.local` (probably `Snaps` or `snaps`)
- **Environment**: Select **Production**, **Preview**, and **Development** ✅
- Click **Save**

#### Variable 4:
- **Key**: `UPLOAD_SECRET`
- **Value**: Copy from your `.env.local` (probably `Sud@123`)
- **Environment**: Select **Production**, **Preview**, and **Development** ✅
- Click **Save**

### Step 4: Redeploy

**CRITICAL**: After adding variables, you MUST redeploy:

1. Go to **Deployments** tab
2. Find the latest deployment
3. Click the **"..."** menu (three dots)
4. Click **"Redeploy"**
5. Wait for deployment to complete (2-3 minutes)

### Step 5: Test

1. Visit: `https://thesud.online/api/debug`
2. You should see:
   - ✅ All environment variables set
   - ✅ Bucket access successful
   - Sample file URLs

3. Visit: `https://thesud.online`
4. Images should now load!

## Common Mistakes

❌ **Don't forget to redeploy** - Variables won't work until you redeploy
❌ **Wrong bucket name case** - Must match exactly (Snaps vs snaps)
❌ **Missing environments** - Make sure to select Production, Preview, AND Development
❌ **Extra spaces** - Don't add spaces before/after values

## Still Not Working?

1. Check Vercel logs: Dashboard → Your Project → Logs
2. Check debug endpoint: `/api/debug`
3. Verify bucket name in Supabase Dashboard → Storage
4. Make sure bucket is **Public** ✅

