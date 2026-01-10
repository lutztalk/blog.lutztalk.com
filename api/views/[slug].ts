import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Redis } from '@upstash/redis';

// Initialize Redis from environment variables
const redis = new Redis({
  url: process.env.KV_REST_API_URL!,
  token: process.env.KV_REST_API_TOKEN!,
});

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
    if (req.method === 'GET') {
      const count = await redis.get<number>(key) || 0;
      res.setHeader('Cache-Control', 'public, max-age=30');
      return res.status(200).json({ count });
    }

    if (req.method === 'POST') {
      // Atomically increment the count
      const count = await redis.incr(key);
      return res.status(200).json({ count });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Redis error:', error);
    return res.status(500).json({ 
      error: 'Redis error',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

