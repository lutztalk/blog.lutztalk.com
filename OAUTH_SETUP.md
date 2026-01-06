# OAuth Proxy Setup for Decap CMS on Vercel

Since Vercel doesn't provide built-in OAuth support like Netlify, we need to set up an OAuth proxy. I've created a Vercel serverless function, but we need to configure it properly.

## Option 1: Use Vercel Serverless Function (Recommended)

I've created `/api/auth.js` which will handle the OAuth flow. However, **this approach has limitations** because Decap CMS expects a specific OAuth flow format.

## Option 2: Use Cloudflare Worker (Easier & Recommended)

The easiest solution is to use a Cloudflare Worker as an OAuth proxy. Here's how:

### Step 1: Deploy Decap Proxy to Cloudflare

1. Go to https://github.com/sterlingwes/decap-proxy
2. Click "Deploy to Cloudflare Workers"
3. Or manually:
   - Fork/clone the repo
   - Install Wrangler: `npm install -g wrangler`
   - Set secrets:
     ```
     wrangler secret put GITHUB_CLIENT_ID
     wrangler secret put GITHUB_CLIENT_SECRET
     ```
   - Deploy: `wrangler publish`

### Step 2: Get Your GitHub OAuth Credentials

1. Go to https://github.com/settings/developers
2. Find your OAuth App (Client ID: `Ov23lijDHaq5UiGv0AUI`)
3. Generate a new Client Secret if you don't have it
4. Update the Authorization callback URL to: `https://your-cloudflare-worker.workers.dev/callback`

### Step 3: Update config.yml

Once you have your Cloudflare Worker URL (e.g., `https://decap-proxy.your-subdomain.workers.dev`), update `public/config.yml`:

```yaml
backend:
  name: github
  repo: lutztalk/blog.lutztalk.com
  branch: main
  base_url: https://your-cloudflare-worker.workers.dev
  auth_endpoint: auth
  auth_type: pkce
  auth_scope: repo
  site_id: blog.lutztalk.com
  app_id: Ov23lijDHaq5UiGv0AUI
```

Replace `https://your-cloudflare-worker.workers.dev` with your actual Cloudflare Worker URL.

### Step 4: Test

1. Go to `https://blog.lutztalk.com/admin`
2. Click "Login with GitHub"
3. You should be redirected to GitHub for authentication
4. After authorizing, you'll be redirected back and logged in!

## Option 3: Use DecapBridge (Paid Service)

If you want a managed solution, check out https://decapbridge.com/ - it provides OAuth and user management for Decap CMS.

## Current Status

Your current setup has:
- ✅ GitHub OAuth App created (Client ID: `Ov23lijDHaq5UiGv0AUI`)
- ✅ Config.yml configured
- ❌ OAuth proxy needed (Cloudflare Worker recommended)

The Vercel serverless function I created (`/api/auth.js`) won't work directly with Decap CMS because it expects a different OAuth flow format. The Cloudflare Worker solution is the most reliable approach.

