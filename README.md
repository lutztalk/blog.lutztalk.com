# LutzTalk Blog

A minimal, responsive, accessible and SEO-friendly blog built with Astro. This blog is based on the [AstroPaper](https://github.com/satnaing/astro-paper) theme.

## About

Hi! I'm Austin Lutz. I work in the collaboration and networking world—designing, building, and improving the systems people rely on to communicate. I write about AI, 5G, collaboration platforms, networking, and live broadcasting from the lens of real-world use, experimentation, and lessons learned. You'll find deep dives on collaboration tech, practical takes on AI as a force multiplier, and behind-the-scenes looks at projects I'm actively building. Always learning. Always building.

Visit the blog at [blog.lutztalk.com](https://blog.lutztalk.com)

## 🔥 Features

- [x] **Headless CMS** - Storyblok integration for easy content management
- [x] **Email Subscriptions** - Readers can subscribe to get notified of new posts
- [x] **View Statistics** - Track post views and see active readers in real-time
- [x] **Type-safe content** - Full TypeScript support
- [x] **Super fast performance** - Static site generation with Astro
- [x] **Accessible** - Keyboard navigation and screen reader support
- [x] **Responsive** - Mobile-first design that works on all devices
- [x] **SEO-friendly** - Optimized meta tags, sitemap, and RSS feed
- [x] **Light & dark mode** - Automatic theme switching with user preference
- [x] **Fuzzy search** - Fast client-side search powered by Pagefind
- [x] **Draft posts & pagination** - Control post visibility and paginate listings
- [x] **Dynamic OG images** - Auto-generated Open Graph images for social sharing
- [x] **Reading time estimates** - Calculated reading time for each post
- [x] **Persistent storage** - Upstash Redis for view counts and subscriptions

## 🚀 Project Structure

Inside of this project, you'll see the following folders and files:

```bash
/
├── public/
│   ├── assets/
│   ├── pagefind/ # auto-generated when build
│   └── favicon.svg
│   └── astropaper-og.jpg
│   └── toggle-theme.js
├── api/
│   ├── subscribe.ts          # Email subscription endpoint
│   ├── unsubscribe.ts        # Email unsubscribe endpoint
│   ├── send-newsletter.ts   # Newsletter sending endpoint
│   ├── views/
│   │   └── [slug].ts        # View count tracking
│   └── viewers/
│       └── [slug].ts         # Active viewer tracking
├── src/
│   ├── assets/
│   │   └── icons/
│   │   └── images/
│   ├── components/
│   │   ├── EmailSubscribe.astro  # Subscription form
│   │   ├── ViewStats.astro      # View counter component
│   │   └── ...
│   ├── data/
│   │   └── blog/
│   ├── layouts/
│   ├── pages/
│   │   ├── unsubscribe.astro    # Unsubscribe page
│   │   └── ...
│   ├── styles/
│   ├── utils/
│   │   ├── getStoryblokPosts.ts # Storyblok integration
│   │   └── ...
│   ├── config.ts
│   └── constants.ts
└── astro.config.ts
```

Astro looks for `.astro` or `.md` files in the `src/pages/` directory. Each page is exposed as a route based on its file name.

Any static assets, like images, can be placed in the `public/` directory.

## 📝 Adding Posts

This blog uses [Storyblok](https://www.storyblok.com/) as a headless CMS for managing content. To create a new blog post:

1. Log in to your Storyblok space at https://app.storyblok.com/
2. Navigate to **Content** → **blog** folder
3. Click **Create new** and select your `blogPost` component
4. Fill in the fields (title, description, content, etc.)
5. Click **Publish**

The site will automatically rebuild when you publish content (if webhooks are configured) or you can manually trigger a rebuild in Vercel.

For more details, see [STORYBLOK_SETUP.md](./STORYBLOK_SETUP.md) and [WEBHOOK_SETUP.md](./WEBHOOK_SETUP.md).

## 📧 Email Subscriptions

Readers can subscribe to receive email notifications when new posts are published. The subscription system uses:

- **Resend** for sending emails
- **Upstash Redis** for storing subscriber emails
- Subscription forms on the homepage and footer
- Unsubscribe page at `/unsubscribe`

To send newsletters when you publish a new post, see [EMAIL_SUBSCRIPTION_SETUP.md](./EMAIL_SUBSCRIPTION_SETUP.md).

## 📊 View Statistics

Each blog post displays:
- **Total views** - How many people have read the post
- **Active viewers** - How many people are currently viewing the post (updates every 10 seconds)

View counts are stored persistently in Upstash Redis and increment when someone visits an individual post page. For setup details, see [KV_SETUP.md](./KV_SETUP.md).

```markdown
---
author: Austin Lutz
pubDatetime: 2025-01-05T21:00:00.000-05:00
modDatetime: null
title: "Your Post Title"
featured: false
draft: false
tags:
  - tag1
  - tag2
description: "A brief description of your post"
---

# Your Post Title

Your content here...
```

## 💻 Tech Stack

**Main Framework** - [Astro](https://astro.build/)  
**CMS** - [Storyblok](https://www.storyblok.com/)  
**Email Service** - [Resend](https://resend.com/)  
**Database** - [Upstash Redis](https://upstash.com/) (via Vercel KV)  
**Type Checking** - [TypeScript](https://www.typescriptlang.org/)  
**Styling** - [TailwindCSS](https://tailwindcss.com/)  
**Static Search** - [Pagefind](https://pagefind.app/)  
**Icons** - [Tablers](https://tabler-icons.io/)  
**Code Formatting** - [Prettier](https://prettier.io/)  
**Deployment** - [Vercel](https://vercel.com/)  
**Linting** - [ESLint](https://eslint.org)

## 👨🏻‍💻 Running Locally

Start the project by running the following commands:

```bash
# install dependencies
npm install
# or
pnpm install

# start running the project
npm run dev
# or
pnpm dev
```

The site will be available at `http://localhost:4321`

### Environment Variables

For local development, create a `.env` file in the project root:

```bash
# Required for Storyblok CMS
STORYBLOK_TOKEN=your-storyblok-public-token

# Required for email subscriptions (optional for local dev)
RESEND_API_KEY=your-resend-api-key
RESEND_FROM_EMAIL=noreply@lutztalk.com
RESEND_FROM_NAME=LutzTalk Blog
NEWSLETTER_AUTH_TOKEN=your-secret-token

# Required for view stats and subscriptions (optional for local dev)
KV_REST_API_URL=your-upstash-redis-url
KV_REST_API_TOKEN=your-upstash-redis-token
```

**Note:** Add `.env` to your `.gitignore` to keep your tokens secure!

For production, set these in your Vercel project dashboard under Settings → Environment Variables.

## 🧞 Commands

All commands are run from the root of the project, from a terminal:

| Command                | Action                                                                                                                           |
| :--------------------- | :------------------------------------------------------------------------------------------------------------------------------- |
| `npm install`          | Installs dependencies                                                                                                            |
| `npm run dev`          | Starts local dev server at `localhost:4321`                                                                                      |
| `npm run build`        | Build your production site to `./dist/`                                                                                          |
| `npm run preview`      | Preview your build locally, before deploying                                                                                     |
| `npm run format:check` | Check code format with Prettier                                                                                                  |
| `npm run format`       | Format codes with Prettier                                                                                                       |
| `npm run sync`         | Generates TypeScript types for all Astro modules. [Learn more](https://docs.astro.build/en/reference/cli-reference/#astro-sync). |
| `npm run lint`         | Lint with ESLint                                                                                                                 |

## 📚 Additional Documentation

- [STORYBLOK_SETUP.md](./STORYBLOK_SETUP.md) - Setting up Storyblok CMS
- [WEBHOOK_SETUP.md](./WEBHOOK_SETUP.md) - Configuring webhooks for auto-rebuilds
- [EMAIL_SUBSCRIPTION_SETUP.md](./EMAIL_SUBSCRIPTION_SETUP.md) - Email subscription system setup
- [KV_SETUP.md](./KV_SETUP.md) - Setting up Upstash Redis for persistent storage
- [VERCEL_ENV_SETUP.md](./VERCEL_ENV_SETUP.md) - Quick reference for Vercel environment variables

## 📜 License

Licensed under the MIT License, Copyright © 2025

---

Built with [AstroPaper](https://github.com/satnaing/astro-paper) theme by [Sat Naing](https://satnaing.dev) 👨🏻‍💻
