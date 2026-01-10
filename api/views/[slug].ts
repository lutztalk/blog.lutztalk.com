import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Redis } from '@upstash/redis';

// Initialize Redis from environment variables
function getRedis() {
  const url = process.env.KV_REST_API_URL;
  const token = process.env.KV_REST_API_TOKEN;

  if (!url || !token) {
    throw new Error('Redis environment variables not set. KV_REST_API_URL and KV_REST_API_TOKEN are required.');
  }

  return new Redis({
    url,
    token,
  });
}

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Viewer-ID');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const slug = req.query.slug as string;
  
  if (!slug) {
    return res.status(400).json({ error: 'Slug required' });
  }

  const key = `views:${slug}`;

  try {
    const redis = getRedis();

    if (req.method === 'GET') {
      const count = await redis.get<number>(key);
      const finalCount = typeof count === 'number' ? count : 0;
      console.log(`[Views API] GET ${slug}: count=${finalCount}`);
      res.setHeader('Cache-Control', 'public, max-age=30');
      return res.status(200).json({ count: finalCount });
    }

    if (req.method === 'POST') {
      // Atomically increment the count
      // incr returns the new value as a number
      const count = await redis.incr(key);
      console.log(`[Views API] POST ${slug}: incremented to ${count}`);
      return res.status(200).json({ count });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('[Views API] Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('[Views API] Error details:', {
      message: errorMessage,
      hasUrl: !!process.env.KV_REST_API_URL,
      hasToken: !!process.env.KV_REST_API_TOKEN,
      slug,
      key,
    });
    return res.status(500).json({ 
      error: 'Redis error',
      details: errorMessage,
      configured: {
        hasUrl: !!process.env.KV_REST_API_URL,
        hasToken: !!process.env.KV_REST_API_TOKEN,
      }
    });
  }
}

