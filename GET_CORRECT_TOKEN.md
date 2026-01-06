# How to Get the Correct Storyblok Token

## The Problem
The token `uar6PTQtvVXfISWkVhiYEgtt` is showing as "Unauthorized". This usually means:
1. It's a **Personal Access Token** (for Management API) instead of a **Public Token** (for Content Delivery API)
2. It's a **Preview Token** instead of a **Public Token**
3. The token format is incorrect

## Solution: Get a Public Access Token

### Step 1: Go to Your Storyblok Space
1. Log in to https://app.storyblok.com/
2. Select your space: **blog.lutztalk.com** (Space ID: 289662251417799)

### Step 2: Navigate to Access Tokens
1. Click **Settings** (gear icon in left sidebar)
2. Click **Access Tokens** in the settings menu

### Step 3: Find or Create a Public Token
Look for a token with these characteristics:
- **Type**: Should say "Public" (NOT "Preview" or "Personal")
- **Purpose**: Used for Content Delivery API (fetching published content)
- **Format**: Usually just the token string, or sometimes `{space_id}-{token}`

### Step 4: If No Public Token Exists
1. Click **Generate New Token** or **Add Token**
2. Select **Public** as the token type
3. Give it a name like "Blog Public Token"
4. Click **Generate** or **Save**
5. **Copy the token immediately** (you won't be able to see it again!

### Step 5: Update Your Configuration

**In Vercel:**
1. Go to https://vercel.com/dashboard
2. Select `blog.lutztalk.com` project
3. **Settings** → **Environment Variables**
4. Update `STORYBLOK_TOKEN` with the new Public token
5. **Save** and **Redeploy**

**Locally (for testing):**
Update your `.env` file:
```
STORYBLOK_TOKEN=your-new-public-token-here
```

## Token Types Explained

- **Public Token**: ✅ Use this for fetching published content (what we need)
- **Preview Token**: ❌ Only for draft/unpublished content
- **Personal Access Token**: ❌ Only for Management API (creating/editing content)

## Verify Your Token Works

After updating, test locally:
```bash
npm run build
```

You should see logs like:
```
[Storyblok] Found X stories
  - Your Post Name (slug: ...)
```

If you still see "Unauthorized", double-check:
- The token is labeled "Public" in Storyblok
- No extra spaces when copying
- Token is updated in both Vercel and local .env

