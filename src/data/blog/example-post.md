---
author: Austin Lutz
pubDatetime: 2025-01-05T21:00:00.000-05:00
modDatetime: null
title: "Example Blog Post"
featured: false
draft: false
tags:
  - example
  - tutorial
description: "This is an example blog post to show you the structure."
---

# Example Blog Post

This is an example of how to create a blog post. You can write your content here using Markdown.

## How to Create a Post

1. Create a new `.md` file in the `src/data/blog/` directory
2. Add the frontmatter (the YAML section between the `---` markers)
3. Write your content in Markdown below the frontmatter

## Frontmatter Fields

- **author**: Your name (defaults to the site author if not specified)
- **pubDatetime**: Publication date in ISO format
- **modDatetime**: Last modified date (optional, can be null)
- **title**: The title of your post
- **featured**: Set to `true` to feature the post (optional)
- **draft**: Set to `true` to hide the post (optional)
- **tags**: Array of tags for categorization
- **description**: SEO description of the post
- **ogImage**: Custom Open Graph image (optional)
- **canonicalURL**: Canonical URL if republished (optional)
- **hideEditPost**: Hide the edit post link (optional)
- **timezone**: Override timezone for this post (optional)

## Markdown Support

You can use all standard Markdown features:

- **Bold text**
- *Italic text*
- [Links](https://example.com)
- Lists (ordered and unordered)
- Code blocks
- And more!

