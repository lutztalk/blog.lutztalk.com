/**
 * Calculate reading time for a given text
 * Based on average reading speed of 200 words per minute
 */
export function getReadingTime(content: string): number {
  // Remove markdown syntax and HTML tags
  const text = content
    .replace(/```[\s\S]*?```/g, "") // Remove code blocks
    .replace(/`[^`]+`/g, "") // Remove inline code
    .replace(/\[([^\]]+)\]\([^\)]+\)/g, "$1") // Convert markdown links to text
    .replace(/[#*_~`]/g, "") // Remove markdown formatting
    .replace(/<[^>]+>/g, "") // Remove HTML tags
    .replace(/\n+/g, " ") // Replace newlines with spaces
    .trim();

  // Count words (split by whitespace and filter empty strings)
  const words = text.split(/\s+/).filter(word => word.length > 0);
  const wordCount = words.length;

  // Average reading speed: 200 words per minute
  const wordsPerMinute = 200;
  const readingTime = Math.ceil(wordCount / wordsPerMinute);

  // Minimum reading time is 1 minute
  return Math.max(1, readingTime);
}

