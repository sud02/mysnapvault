# MySnapVault

Public gallery with private upload using Next.js App Router, Vercel API routes, and Supabase Storage.

## Features

- Public gallery at `/`
- Private upload at `/upload` (requires secret header)
- Serverless routes:
  - `GET /api/list-snaps` – lists public URLs from the `snaps` bucket
  - `POST /api/upload-snap` – uploads an image if `x-upload-secret` header matches `UPLOAD_SECRET`
- Supabase public bucket with CDN URLs

## Environment

Create a local env file `.env.local` with:

```
SUPABASE_URL=your_supabase_project_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
UPLOAD_SECRET=your_private_upload_secret
SNAPS_BUCKET=snaps
# Optional, for absolute URLs in certain contexts:
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

On Vercel, add the same variables in Project Settings → Environment Variables. `SUPABASE_SERVICE_ROLE_KEY` must be kept server-only.

## Supabase Setup

1. Create a bucket named `snaps` in Storage.
2. Mark it Public.
3. Note your Project URL and Service Role Key from Settings → API.

## Develop

```
npm install
npm run dev
```

Visit http://localhost:3000

## Upload

- Go to `/upload`.
- Enter the secret (must match `UPLOAD_SECRET`).
- Pick an image (max 50 MB) and upload.

## Deploy to Vercel

- Push to a Git repo (GitHub/GitLab/Bitbucket).
- Import the repo into Vercel.
- Add environment variables.
- Deploy. The API routes and gallery work on Vercel.
