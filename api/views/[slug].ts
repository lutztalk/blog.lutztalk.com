import type { VercelRequest, VercelResponse } from '@vercel/node';
import { kv } from '@vercel/kv';

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
      const count = await kv.get<number>(key) || 0;
      res.setHeader('Cache-Control', 'public, max-age=30');
      return res.status(200).json({ count });
    }

    if (req.method === 'POST') {
      // Atomically increment the count
      const count = await kv.incr(key);
      return res.status(200).json({ count });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('KV error:', error);
    // If KV is not configured, return an error
    // User needs to set up Vercel KV in their project settings
    return res.status(500).json({ 
      error: 'KV not configured. Please set up Vercel KV in your project settings.',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

