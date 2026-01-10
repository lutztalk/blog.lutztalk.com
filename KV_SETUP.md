# Vercel KV Setup for View Stats

The view stats feature requires Vercel KV for persistent storage. Without it, view counts will reset on each serverless function cold start.

## Setup Steps

1. **Access the Vercel Marketplace:**
   - Go to your Vercel project dashboard
   - Navigate to the "Storage" tab
   - Click "Learn more" next to "Marketplace Database Providers" or look for KV in the marketplace
   - Alternatively, go directly to: https://vercel.com/marketplace

2. **Create a Vercel KV Database:**
   - Search for "KV" or "Upstash" (Vercel KV is powered by Upstash)
   - Click on the KV/Upstash option
   - Click "Add Integration" or "Create Database"
   - Choose a name (e.g., "blog-views")
   - Select a region (choose the closest to your users)
   - Follow the setup wizard to create the database

3. **Link the KV Database to Your Project:**
   - After creating the database, Vercel will automatically link it to your project
   - The environment variables will be automatically set:
     - `KV_URL`
     - `KV_REST_API_URL`
     - `KV_REST_API_TOKEN`
     - `KV_REST_API_READ_ONLY_TOKEN`

4. **Verify the Setup:**
   - The `@vercel/kv` package is already installed
   - The API routes will automatically use KV when these environment variables are present
   - If KV is not configured, the API will return an error message
   - Redeploy your project after setting up KV

## How It Works

- View counts are stored in Vercel KV with keys like `views:article-slug`
- Each navigation to an article increments the count atomically
- Counts persist across deployments and function cold starts
- The `kv.incr()` function ensures thread-safe increments

## Troubleshooting

If you see "KV not configured" errors:
1. Make sure you've created a KV database in Vercel
2. Check that the database is linked to your project
3. Verify environment variables are set (they should be automatic)
4. Redeploy your project after setting up KV

