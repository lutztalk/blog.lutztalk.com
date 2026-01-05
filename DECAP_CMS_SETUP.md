# Decap CMS Setup Guide

Decap CMS (formerly Netlify CMS) has been installed and configured for your blog. Follow these steps to complete the setup:

## 1. Access the Admin Interface

Once deployed, you can access the admin interface at:
- **Local development**: `http://localhost:4321/admin/`
- **Production**: `https://blog.lutztalk.com/admin/`

## 2. GitHub OAuth Setup (Required for Production)

For the CMS to work in production, you need to set up GitHub OAuth:

### Option A: Using Netlify (Recommended if deploying to Netlify)

If you're deploying to Netlify, the OAuth is automatically configured. Just make sure:
1. Your site is deployed on Netlify
2. The GitHub integration is connected
3. Access `/admin/` on your deployed site

### Option B: Manual GitHub OAuth App Setup

1. Go to GitHub Settings → Developer settings → OAuth Apps
2. Click "New OAuth App"
3. Fill in:
   - **Application name**: `LutzTalk Blog CMS`
   - **Homepage URL**: `https://blog.lutztalk.com`
   - **Authorization callback URL**: `https://blog.lutztalk.com/admin/`
4. Click "Register application"
5. Copy the **Client ID**
6. Generate a new **Client Secret**
7. Update `public/admin/config.yml` with:
   ```yaml
   backend:
     name: github
     repo: lutztalk/blog.lutztalk.com
     branch: main
     base_url: https://blog.lutztalk.com
     auth_type: pkce
     auth_scope: repo
   ```

### Option C: Using GitHub Personal Access Token (For Development)

For local development, you can use a personal access token:

1. Go to GitHub Settings → Developer settings → Personal access tokens → Tokens (classic)
2. Generate a new token with `repo` scope
3. Use the token when prompted in the CMS

## 3. Using the CMS

1. Navigate to `/admin/` on your site
2. Click "Login with GitHub"
3. Authorize the application
4. You'll see the "Blog Posts" collection
5. Click "New Blog Post" to create a post
6. Fill in the fields:
   - Title
   - Author (defaults to "Austin Lutz")
   - Publish Date
   - Description
   - Tags
   - Featured (optional)
   - Draft (optional - set to true to hide from public)
   - Body (Markdown content)
7. Click "Publish" to save and commit to GitHub

## 4. File Naming

Posts are automatically saved with a slug based on the title. The file will be created in `src/data/blog/` with the format: `your-post-title.md`

## 5. Local Development

For local development, you can:
- Run `npm run dev`
- Navigate to `http://localhost:4321/admin/`
- Use GitHub authentication to log in
- Create and edit posts directly

## Notes

- All changes are committed directly to your GitHub repository
- The CMS uses the same markdown format as your existing posts
- Draft posts (with `draft: true`) won't appear in the public blog listing
- The CMS automatically formats dates in the correct ISO format

