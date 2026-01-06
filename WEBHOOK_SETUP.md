# Storyblok Webhook Setup for Auto-Rebuilds

## Overview
Set up a webhook so that when you publish content in Storyblok, Vercel automatically rebuilds your site.

## Step 1: Get Your Vercel Deploy Hook

1. Go to https://vercel.com/dashboard
2. Select your `blog.lutztalk.com` project
3. Go to **Settings** → **Git**
4. Scroll down to **Deploy Hooks**
5. Click **Create Hook**
6. Name it: "Storyblok Content Update"
7. Select the branch: `main`
8. Click **Create Hook**
9. **Copy the webhook URL** (looks like: `https://api.vercel.com/v1/integrations/deploy/...`)

## Step 2: Configure Webhook in Storyblok

1. Go to https://app.storyblok.com/
2. Select your space: **blog.lutztalk.com**
3. Go to **Settings** → **Webhooks**
4. Click **Create Webhook**
5. Configure:
   - **Name**: "Vercel Rebuild"
   - **URL**: Paste your Vercel deploy hook URL
   - **Trigger**: Select **Story published** and **Story unpublished**
   - **Space**: Select your space
   - **Content Type**: Leave empty (to trigger on all content) or select `blogPost`
6. Click **Save**

## Step 3: Test It

1. Go to Storyblok and edit a post
2. Click **Publish**
3. Check your Vercel dashboard - you should see a new deployment start automatically!

## Alternative: Manual Rebuild

If you don't want automatic rebuilds, you can manually trigger rebuilds:
- In Vercel dashboard → **Deployments** → Click the three dots → **Redeploy**

## Benefits

- ✅ Content updates automatically go live
- ✅ No manual deployment needed
- ✅ Fast turnaround time for content changes

