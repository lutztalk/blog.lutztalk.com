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

## Step 4: Create a Blog Post Component in Storyblok

In Storyblok, content types are called "Components" or "Blocks". Here's how to create one:

1. **Go to Components:**
   - In your Storyblok space, click on **Components** in the left sidebar (or go to **Settings** → **Components**)

2. **Create a New Component:**
   - Click **Create new block** or **Add Component**
   - In the modal that appears:
     - **Technical name:** Enter `blogPost` (this is what the API will use)
     - **Description:** Enter "Blog Post" (this is just for display)
     - **Select block type:** Choose **Content type block** (the first option)
   - Click **Add Block**

3. **Add Fields to Your Component:**
   - You'll now see the component editor
   - Click **Add field** for each field below:
   
   **Required Fields:**
   - **title** (Field type: Text, Required: Yes) - The post title
   - **description** (Field type: Textarea, Required: Yes) - SEO description
   - **content** (Field type: Rich Text, Required: Yes) - The main post content
   
   **Optional Fields:**
   - **author** (Field type: Text, Default: "Austin Lutz") - Author name
   - **publishDate** (Field type: Date) - Publication date
   - **modifiedDate** (Field type: Date) - Last modified date
   - **featured** (Field type: Boolean, Default: false) - Feature on homepage
   - **draft** (Field type: Boolean, Default: false) - Hide from site
   - **tags** (Field type: Tags or Multi-option) - Post tags

4. **Save the Component:**
   - Click **Save** in the top right

## Step 5: Create Your First Blog Post

1. **Go to Content:**
   - Click **Content** in the left sidebar

2. **Create a Blog Folder:**
   - Click the **+** button or **Create new**
   - Select **Folder**
   - Name it `blog`
   - Click **Create**

3. **Create Your First Post:**
   - Click on the `blog` folder
   - Click **Create new** or the **+** button
   - Select your `blogPost` component
   - Fill in the fields:
     - **Title:** Your post title
     - **Description:** A brief description
     - **Content:** Write your post (use the rich text editor)
     - Set **Publish Date** if you want
     - Set **Featured** to true if you want it on the homepage
     - Leave **Draft** as false to publish it
   - Click **Publish** (top right)

**Important:** Make sure posts are created inside the `blog` folder. The slug will be `blog/your-post-slug` automatically.

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

