# Creating Blog Posts

Since we're not using Decap CMS, you'll create posts manually by adding markdown files to the repository.

## How to Create a Post

1. **Navigate to the blog directory:**
   - Go to: `https://github.com/lutztalk/blog.lutztalk.com/tree/main/src/data/blog`

2. **Create a new file:**
   - Click "Add file" → "Create new file"
   - Name it something like: `my-post-title.md` (use kebab-case, e.g., `my-awesome-post.md`)

3. **Add the frontmatter and content:**
   ```markdown
   ---
   author: Austin Lutz
   pubDatetime: 2025-01-06T12:00:00.000-05:00
   modDatetime: null
   title: "Your Post Title"
   featured: false
   draft: false
   tags:
     - tag1
     - tag2
   description: "A brief description of your post for SEO"
   ---

   # Your Post Title

   Your content goes here. You can use **Markdown** formatting.

   ## Subheading

   More content...
   ```

4. **Commit the file:**
   - Scroll down and click "Commit new file"
   - Add a commit message like "Add new post: Your Post Title"
   - Click "Commit new file"

5. **Wait for deployment:**
   - Vercel will automatically rebuild and deploy your site
   - Your new post will appear on the blog within a few minutes

## Frontmatter Fields

- **author**: Your name (defaults to "Austin Lutz" from config)
- **pubDatetime**: Publication date in ISO format (e.g., `2025-01-06T12:00:00.000-05:00`)
- **modDatetime**: Last modified date (optional, can be `null`)
- **title**: The title of your post
- **featured**: Set to `true` to feature the post on the homepage
- **draft**: Set to `true` to hide the post (won't appear on the site)
- **tags**: Array of tags for categorization
- **description**: SEO description of the post

## Editing Existing Posts

1. Go to the post file in GitHub
2. Click the pencil icon to edit
3. Make your changes
4. Update `modDatetime` if you want to track when it was last modified
5. Commit your changes

That's it! Simple and straightforward. 🎉

