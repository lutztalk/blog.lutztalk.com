// Quick test script to verify Storyblok connection
// Run with: node test-storyblok.js

import { config } from 'dotenv';
config();

const token = process.env.STORYBLOK_TOKEN;

if (!token) {
  console.error('❌ STORYBLOK_TOKEN not found in environment');
  console.log('Make sure you have a .env file with STORYBLOK_TOKEN=your-token');
  process.exit(1);
}

console.log('✅ STORYBLOK_TOKEN found');
console.log(`Token starts with: ${token.substring(0, 10)}...`);

// Test API call
const url = `https://api.storyblok.com/v2/cdn/stories?starts_with=blog/&token=${token}&version=published`;

fetch(url)
  .then(res => res.json())
  .then(data => {
    console.log('\n📝 Stories found:', data.stories?.length || 0);
    if (data.stories && data.stories.length > 0) {
      console.log('\nPosts:');
      data.stories.forEach(story => {
        console.log(`  - ${story.name} (slug: ${story.slug})`);
        console.log(`    Published: ${story.published_at || 'Not published'}`);
        console.log(`    Draft: ${story.content.draft || false}`);
      });
    } else {
      console.log('\n⚠️  No posts found. Make sure:');
      console.log('  1. Your post is in a folder called "blog"');
      console.log('  2. Your post is published (not in draft)');
      console.log('  3. The "draft" field is set to false');
    }
  })
  .catch(err => {
    console.error('❌ Error fetching from Storyblok:', err.message);
  });

