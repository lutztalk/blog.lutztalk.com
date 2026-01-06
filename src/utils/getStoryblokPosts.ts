import { useStoryblokApi } from "@storyblok/astro";

export interface StoryblokPost {
  id: string;
  slug: string;
  data: {
    title: string;
    description: string;
    author: string;
    pubDatetime: Date;
    modDatetime: Date | null;
    featured: boolean;
    draft: boolean;
    tags: string[];
    content: any; // Storyblok rich text content
  };
}

/**
 * Fetch all blog posts from Storyblok
 */
export async function getStoryblokPosts(): Promise<StoryblokPost[]> {
  const storyblokApi = useStoryblokApi();
  
  try {
    // First, try to get stories from blog/ folder
    let { data } = await storyblokApi.get("cdn/stories", {
      starts_with: "blog/",
      version: import.meta.env.DEV ? "draft" : "published",
      per_page: 100,
    });

    let stories = data.stories || [];
    
    // If no stories found in blog/, try getting all stories and filter by component type
    if (stories.length === 0) {
      console.log("[Storyblok] No stories found in blog/ folder, trying all stories...");
      const allData = await storyblokApi.get("cdn/stories", {
        version: import.meta.env.DEV ? "draft" : "published",
        per_page: 100,
      });
      
      // Filter by component type (blogPost) or check if slug contains blog
      stories = (allData.data.stories || []).filter((story: any) => {
        const component = story.content?.component || story.content?._uid;
        return component === "blogPost" || story.slug?.includes("blog") || story.full_slug?.includes("blog");
      });
    }
    
    // Log for debugging
    console.log(`[Storyblok] Found ${stories.length} stories`);
    if (stories.length > 0) {
      stories.forEach((story: any) => {
        console.log(`  - ${story.name} (slug: ${story.slug}, full_slug: ${story.full_slug}, component: ${story.content?.component || 'unknown'})`);
        console.log(`    Published: ${story.published_at || 'No'}, Draft field: ${story.content?.draft || false}`);
        console.log(`    Content keys:`, Object.keys(story.content || {}));
      });
    } else {
      console.log("[Storyblok] No stories found. Make sure:");
      console.log("  1. Your post is published in Storyblok");
      console.log("  2. Your post uses the 'blogPost' component");
      console.log("  3. Your post is in a 'blog' folder (or has 'blog' in the slug)");
    }
    
    return stories.map((story: any) => {
      const content = story.content;
      
      // Extract just the post slug (remove "blog/" prefix if present)
      let postSlug = story.slug;
      if (postSlug.startsWith("blog/")) {
        postSlug = postSlug.replace("blog/", "");
      }
      
      return {
        id: story.id.toString(),
        slug: postSlug,
        data: {
          title: content.title || "",
          description: content.description || "",
          author: content.author || "Austin Lutz",
          pubDatetime: content.publishDate 
            ? new Date(content.publishDate) 
            : new Date(story.published_at || story.created_at),
          modDatetime: content.modifiedDate 
            ? new Date(content.modifiedDate) 
            : story.published_at ? new Date(story.published_at) : null,
          featured: content.featured || false,
          draft: content.draft || false,
          tags: content.tags || [],
          content: content.content || content.body || "",
        },
      };
    });
  } catch (error: any) {
    console.error("Error fetching Storyblok posts:", error);
    if (error?.response?.data) {
      console.error("Storyblok API Error:", error.response.data);
    }
    if (error?.message) {
      console.error("Error message:", error.message);
    }
    if (error?.status === 401) {
      console.error("❌ Unauthorized - Check your STORYBLOK_TOKEN:");
      console.error("   1. Go to Storyblok → Settings → Access Tokens");
      console.error("   2. Copy your PUBLIC token (not Preview token)");
      console.error("   3. Make sure it's set in Vercel environment variables");
      console.error("   4. Token should look like: {space_id}-{token} or just {token}");
    }
    return [];
  }
}

/**
 * Fetch a single blog post by slug
 */
export async function getStoryblokPost(slug: string): Promise<StoryblokPost | null> {
  const storyblokApi = useStoryblokApi();
  
  try {
    // Try with blog/ prefix first
    let story;
    try {
      const { data } = await storyblokApi.get(`cdn/stories/blog/${slug}`, {
        version: import.meta.env.DEV ? "draft" : "published",
      });
      story = data.story;
    } catch (e) {
      // If that fails, try without the prefix
      const { data } = await storyblokApi.get(`cdn/stories/${slug}`, {
        version: import.meta.env.DEV ? "draft" : "published",
      });
      story = data.story;
    }

    const content = story.content;
    
    // Extract just the post slug (remove "blog/" prefix if present)
    let postSlug = story.slug;
    if (postSlug.startsWith("blog/")) {
      postSlug = postSlug.replace("blog/", "");
    }
    
    return {
      id: story.id.toString(),
      slug: postSlug,
      data: {
        title: content.title || "",
        description: content.description || "",
        author: content.author || "Austin Lutz",
        pubDatetime: content.publishDate 
          ? new Date(content.publishDate) 
          : new Date(story.published_at || story.created_at),
        modDatetime: content.modifiedDate 
          ? new Date(content.modifiedDate) 
          : story.published_at ? new Date(story.published_at) : null,
        featured: content.featured || false,
        draft: content.draft || false,
        tags: content.tags || [],
        content: content.content || content.body || "",
      },
    };
  } catch (error) {
    console.error(`Error fetching Storyblok post ${slug}:`, error);
    if (error instanceof Error) {
      console.error("Error details:", error.message);
    }
    return null;
  }
}

/**
 * Sort posts by date (newest first)
 */
export function sortStoryblokPosts(posts: StoryblokPost[]): StoryblokPost[] {
  return posts
    .filter(post => !post.data.draft)
    .sort((a, b) => {
      const dateA = a.data.modDatetime || a.data.pubDatetime;
      const dateB = b.data.modDatetime || b.data.pubDatetime;
      return dateB.getTime() - dateA.getTime();
    });
}

