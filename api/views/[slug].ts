import type { VercelRequest, VercelResponse } from '@vercel/node';

// In-memory store (persists within the same serverless function instance)
// Note: Counts reset on cold starts. For production persistence, use Vercel KV.
const viewCounts = new Map<string, number>();

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

  if (req.method === 'GET') {
    const count = viewCounts.get(slug) || 0;
    res.setHeader('Cache-Control', 'public, max-age=30');
    return res.status(200).json({ count });
  }

  if (req.method === 'POST') {
    const current = viewCounts.get(slug) || 0;
    viewCounts.set(slug, current + 1);
    return res.status(200).json({ count: current + 1 });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}

