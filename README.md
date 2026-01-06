# LutzTalk Blog

A minimal, responsive, accessible and SEO-friendly blog built with Astro. This blog is based on the [AstroPaper](https://github.com/satnaing/astro-paper) theme.

## About

Hi! I'm Austin Lutz. I work in the collaboration and networking world—designing, building, and improving the systems people rely on to communicate. I write about AI, 5G, collaboration platforms, networking, and live broadcasting from the lens of real-world use, experimentation, and lessons learned. You'll find deep dives on collaboration tech, practical takes on AI as a force multiplier, and behind-the-scenes looks at projects I'm actively building. Always learning. Always building.

Visit the blog at [blog.lutztalk.com](https://blog.lutztalk.com)

## 🔥 Features

- [x] type-safe markdown
- [x] super fast performance
- [x] accessible (Keyboard/VoiceOver)
- [x] responsive (mobile ~ desktops)
- [x] SEO-friendly
- [x] light & dark mode
- [x] fuzzy search
- [x] draft posts & pagination
- [x] sitemap & rss feed
- [x] followed best practices
- [x] highly customizable
- [x] dynamic OG image generation for blog posts
- [x] reading time estimates

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
├── src/
│   ├── assets/
│   │   └── icons/
│   │   └── images/
│   ├── components/
│   ├── data/
│   │   └── blog/
│   │       └── blog-posts.md
│   ├── layouts/
│   └── pages/
│   └── styles/
│   └── utils/
│   └── config.ts
│   └── constants.ts
│   └── content.config.ts
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

# start running the project
npm run dev
```

The site will be available at `http://localhost:4321`

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

## 📜 License

Licensed under the MIT License, Copyright © 2025

---

Built with [AstroPaper](https://github.com/satnaing/astro-paper) theme by [Sat Naing](https://satnaing.dev) 👨🏻‍💻
