export const SITE = {
  website: "https://blog.lutztalk.com/", // replace this with your deployed domain
  author: "Austin Lutz",
  profile: "https://blog.lutztalk.com/",
  desc: "Hey there! I'm Austin Lutz, and welcome to LutzTalk—my little corner of the internet where I geek out about all the cool stuff that makes the digital world go 'round. From AI that's getting smarter by the day (and maybe a little too smart for comfort), to 5G networks that are zipping data around faster than you can say 'buffering,' I'm here to break it all down. We'll chat about collaboration tools that make remote work actually work, broadcasting tech that brings us together, and networking wizardry that keeps everything connected. Think of this as your friendly neighborhood tech talk show, but with fewer commercials and way more enthusiasm. Grab a coffee, pull up a chair, and let's talk tech!",
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
