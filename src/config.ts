export const SITE = {
  website: "https://blog.lutztalk.com/", // replace this with your deployed domain
  author: "Austin Lutz",
  profile: "https://blog.lutztalk.com/",
  desc: "I'm Austin Lutz. I write about AI, 5G, collaboration tools, networking, and broadcasting stuff that catches my eye. Sometimes it's deep dives, sometimes it's quick thoughts. Always honest. Let's talk tech!",
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
