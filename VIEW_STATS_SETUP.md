# View Stats Setup Guide

This feature tracks view counts and shows how many other people are currently viewing each article.

## How It Works

- **View Counter**: Tracks total views per post (increments once per session)
- **Active Viewers**: Shows how many other people are viewing the same post right now (updates every 10 seconds)
- **Pure Browser-Based**: All tracking happens client-side via JavaScript
- **Vercel Edge Functions**: API endpoints run on Vercel's edge network for fast response times

## Setup Instructions

### Option 1: Simple In-Memory (Current - Resets on Deploy)

The current implementation uses in-memory storage. This works but resets when Vercel redeploys.

### Option 2: Vercel KV (Recommended for Production)

For persistent storage that survives deployments:

1. **Install Vercel KV:**
   ```bash
   npm install @vercel/kv
   ```

2. **Create a Vercel KV Database:**
   - Go to your [Vercel Dashboard](https://vercel.com/dashboard)
   - Select your project
   - Go to **Storage** → **Create Database**
   - Choose **KV** (Key-Value)
   - Name it (e.g., `blog-views`)
   - Copy the connection details

3. **Update API Routes:**
   - Uncomment the KV code in `api/views/[slug].ts`
   - Uncomment the KV code in `api/viewers/[slug].ts`
   - The code is already prepared with comments showing where to use KV

4. **Set Environment Variables:**
   - Vercel will automatically set `KV_REST_API_URL`, `KV_REST_API_TOKEN`, etc. when you connect KV
   - No manual configuration needed!

### Option 3: Alternative Services

You could also use:
- **Upstash Redis** (similar to Vercel KV)
- **PlanetScale** (MySQL database)
- **Supabase** (PostgreSQL)
- **Firebase Realtime Database**

## Current Implementation

The feature is already integrated:
- ✅ ViewStats component created
- ✅ Added to post detail pages
- ✅ Added to post listing cards
- ✅ API endpoints created (Edge Functions)
- ✅ Client-side tracking script

## Usage

The stats automatically appear next to the reading time:
- **View count**: "1 view" or "1,234 views"
- **Active viewers**: "2 others viewing" (only shows if > 1 other person)

## Customization

To modify the display or behavior, edit:
- `src/components/ViewStats.astro` - Component and tracking logic
- `api/views/[slug].ts` - View count API
- `api/viewers/[slug].ts` - Active viewers API

