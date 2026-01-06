# Storyblok CMS Setup Guide

Storyblok is a headless CMS that provides a visual editor for managing your blog content.

## Step 1: Create a Storyblok Account

1. Go to https://www.storyblok.com/
2. Sign up for a free account (free tier includes up to 5 users and 10,000 API requests/month)
3. Create a new space for your blog

## Step 2: Get Your Access Token

1. In your Storyblok space, go to **Settings** → **Access Tokens**
2. Copy your **Public Token** (starts with a space ID, e.g., `12345`)
3. You'll need this for the environment variable

## Step 3: Set Environment Variable

Add your Storyblok token to your environment:

### For Local Development

Create a `.env` file in the project root:

```bash
STORYBLOK_TOKEN=your-public-token-here
```

**Important**: Add `.env` to your `.gitignore` to keep your token secure!

### For Vercel Deployment

1. Go to your Vercel project dashboard: https://vercel.com/dashboard
2. Select your `blog.lutztalk.com` project
3. Go to **Settings** → **Environment Variables**
4. Add a new variable:
   - **Name**: `STORYBLOK_TOKEN`
   - **Value**: Your Storyblok public token
   - **Environment**: Production, Preview, and Development (check all)
5. Click **Save**
6. Redeploy your site (or it will auto-deploy on the next push)

## Step 4: Create Content Types in Storyblok

You'll need to create a "Blog Post" content type in Storyblok:

1. In Storyblok, go to **Content** → **Content Types**
2. Click **Create new**
3. Name it "Blog Post"
4. Add the following fields:
   - **Title** (Text field, required)
   - **Description** (Textarea, required)
   - **Author** (Text field, default: "Austin Lutz")
   - **Publish Date** (Date field)
   - **Modified Date** (Date field, optional)
   - **Featured** (Boolean field)
   - **Draft** (Boolean field)
   - **Tags** (Multi-option field or Tags field)
   - **Content** (Rich text field or Markdown field)

## Step 5: Create Your First Post

1. In Storyblok, go to **Content**
2. Click **Create new** → **Blog Post**
3. Fill in the fields
4. Click **Publish**

## Step 6: Update Your Astro Code

The Storyblok integration is already configured in `astro.config.ts`. You'll need to:

1. Create components to render Storyblok content
2. Update your blog pages to fetch from Storyblok instead of markdown files
3. Set up dynamic routes for blog posts

## Next Steps

Once you have your Storyblok token set up, we can:
- Create Storyblok components for rendering blog posts
- Update the blog listing page to fetch from Storyblok
- Set up dynamic routes for individual posts
- Configure webhooks to rebuild on content changes

## Resources

- [Storyblok Astro Integration Docs](https://docs.astro.build/en/guides/cms/storyblok/)
- [Storyblok Documentation](https://www.storyblok.com/docs)
- [Storyblok Astro Package](https://github.com/storyblok/storyblok-astro)

