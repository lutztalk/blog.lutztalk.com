# Debugging Storyblok Connection

## The Issue: "Unauthorized" Error

If you're seeing "Unauthorized" errors, it means the `STORYBLOK_TOKEN` environment variable is not set or is incorrect.

## Quick Fix Steps:

### 1. Verify Your Storyblok Token

1. Go to your Storyblok space: https://app.storyblok.com/
2. Navigate to **Settings** → **Access Tokens**
3. Copy your **Public Token** (it should look like a long string, e.g., `abc123def456...`)

### 2. Set Token in Vercel (For Production)

1. Go to https://vercel.com/dashboard
2. Select your `blog.lutztalk.com` project
3. Go to **Settings** → **Environment Variables**
4. Check if `STORYBLOK_TOKEN` exists:
   - If it exists, verify the value matches your Storyblok Public Token
   - If it doesn't exist, add it:
     - **Name**: `STORYBLOK_TOKEN`
     - **Value**: Your Storyblok Public Token
     - **Environment**: Check all (Production, Preview, Development)
5. Click **Save**
6. **Redeploy** your site (go to Deployments → Latest → Three dots → Redeploy)

### 3. Set Token Locally (For Development)

Create a `.env` file in the project root:

```bash
STORYBLOK_TOKEN=your-public-token-here
```

**Important**: Make sure `.env` is in your `.gitignore` file!

### 4. Verify Your Post in Storyblok

Make sure your post:
- ✅ Is in a folder called `blog` (not just named "blog")
- ✅ Is **Published** (click the "Publish" button in Storyblok)
- ✅ Has the `draft` field set to `false` (if you have that field)
- ✅ Uses the `blogPost` component type

### 5. Test the Connection

After setting the token, rebuild:

```bash
npm run build
```

You should see logs like:
```
[Storyblok] Found X stories
  - Your Post Name (slug: your-post-slug)
```

If you still see "Unauthorized", double-check:
- The token is correct (no extra spaces)
- The token is the **Public Token**, not a Preview Token
- The token is set in the correct environment (Vercel for production, .env for local)

