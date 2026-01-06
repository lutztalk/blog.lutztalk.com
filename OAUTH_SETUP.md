# OAuth Proxy Setup for Decap CMS on Vercel

Since Vercel doesn't provide built-in OAuth support like Netlify, we need to set up an OAuth proxy using a Cloudflare Worker.

## Quick Setup (5 minutes)

I've created a ready-to-deploy Cloudflare Worker in this repo. Here's how to set it up:

### Step 1: Install Wrangler

```bash
npm install -g wrangler
```

### Step 2: Login to Cloudflare

```bash
wrangler login
```

### Step 3: Get Your GitHub OAuth Credentials

1. Go to https://github.com/settings/developers
2. Find your OAuth App (Client ID: `Ov23lijDHaq5UiGv0AUI`)
3. Click on it to view/edit
4. If you don't have a Client Secret, generate one
5. **Update the Authorization callback URL** to: `https://decap-oauth-proxy.YOUR_SUBDOMAIN.workers.dev/callback`
   - Replace `YOUR_SUBDOMAIN` with your Cloudflare Workers subdomain (you'll get this after deployment)

### Step 4: Deploy the Worker

```bash
# Set your GitHub OAuth credentials as secrets
wrangler secret put GITHUB_CLIENT_ID
# When prompted, enter: Ov23lijDHaq5UiGv0AUI

wrangler secret put GITHUB_CLIENT_SECRET
# When prompted, enter your GitHub OAuth App Client Secret

# Deploy the worker
wrangler publish
```

After deployment, you'll get a URL like: `https://decap-oauth-proxy.YOUR_SUBDOMAIN.workers.dev`

### Step 5: Update Your GitHub OAuth App

Go back to your GitHub OAuth App settings and update the **Authorization callback URL** to:
```
https://decap-oauth-proxy.YOUR_SUBDOMAIN.workers.dev/callback
```

### Step 6: Update config.yml

Update `public/config.yml` to use your Cloudflare Worker:

```yaml
backend:
  name: github
  repo: lutztalk/blog.lutztalk.com
  branch: main
  base_url: https://decap-oauth-proxy.YOUR_SUBDOMAIN.workers.dev
  auth_endpoint: auth
  auth_type: pkce
  auth_scope: repo
  site_id: blog.lutztalk.com
  app_id: Ov23lijDHaq5UiGv0AUI
```

Replace `YOUR_SUBDOMAIN` with your actual Cloudflare Workers subdomain.

### Step 7: Test!

1. Commit and push the updated `config.yml`
2. Go to `https://blog.lutztalk.com/admin`
3. Click "Login with GitHub"
4. You should be redirected to GitHub for authentication! 🎉

## Alternative: Use Existing Decap Proxy (Option 2)

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

