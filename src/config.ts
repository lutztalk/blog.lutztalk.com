export const SITE = {
  website: "https://blog.lutztalk.com/", // replace this with your deployed domain
  author: "Austin Lutz",
  profile: "https://blog.lutztalk.com/",
  desc: "I'm Austin Lutz. By day, I work in the collaboration, IT, and networking world—designing, building, and improving the systems people rely on to communicate. I write about AI, 5G, collaboration platforms, networking, and live broadcasting from the lens of real-world use, experimentation, and lessons learned. You'll find deep dives on collaboration tech, practical takes on AI as a force multiplier, and behind-the-scenes looks at projects I'm actively building. Always learning. Always building.",
  title: "LutzTalk",
  ogImage: "astropaper-og.jpg",
  lightAndDarkMode: true,
  postPerIndex: 4,
  postPerPage: 4,
  scheduledPostMargin: 15 * 60 * 1000, // 15 minutes
  showArchives: true,
  showBackButton: true, // show back button in post detail
  editPost: {
    enabled: true,
    text: "Edit page",
    url: "https://github.com/durpnet/blog.lutztalk.com/edit/main/",
  },
  dynamicOgImage: true,
  dir: "ltr", // "rtl" | "auto"
  lang: "en", // html lang code. Set this empty and default will be "en"
  timezone: "America/New_York", // Default global timezone (IANA format) https://en.wikipedia.org/wiki/List_of_tz_database_time_zones
} as const;
