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
    const { data } = await storyblokApi.get("cdn/stories", {
      starts_with: "blog/",
      version: import.meta.env.DEV ? "draft" : "published",
      per_page: 100, // Adjust as needed
    });

    const stories = data.stories || [];
    
    // Log for debugging
    if (import.meta.env.DEV) {
      console.log(`[Storyblok] Found ${stories.length} stories`);
      stories.forEach((story: any) => {
        console.log(`  - ${story.name} (slug: ${story.slug}, full_slug: ${story.full_slug})`);
        console.log(`    Published: ${story.published_at || 'No'}, Draft field: ${story.content.draft || false}`);
      });
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
  } catch (error) {
    console.error("Error fetching Storyblok posts:", error);
    if (error instanceof Error) {
      console.error("Error details:", error.message);
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

