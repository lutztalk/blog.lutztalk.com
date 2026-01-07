import rss from "@astrojs/rss";
import { getStoryblokPosts, sortStoryblokPosts } from "@/utils/getStoryblokPosts";
import { SITE } from "@/config";

export async function GET() {
  const posts = await getStoryblokPosts();
  const sortedPosts = sortStoryblokPosts(posts);
  return rss({
    title: SITE.title,
    description: SITE.desc,
    site: SITE.website,
    items: sortedPosts.map((post) => ({
      link: `${SITE.website}posts/${post.slug}/`,
      title: post.data.title,
      description: post.data.description,
      pubDate: post.data.pubDatetime,
    })),
  });
}
