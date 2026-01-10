import type { VercelRequest, VercelResponse } from '@vercel/node';

interface Viewer {
  id: string;
  lastSeen: number;
}

// In-memory store for active viewers (persists within the same serverless function instance)
// Note: Data resets on cold starts. For production persistence, use Vercel KV.
const activeViewers = new Map<string, Map<string, Viewer>>();
const VIEWER_TIMEOUT = 30000; // 30 seconds

// Clean up old viewers
function cleanupViewers() {
  const now = Date.now();
  activeViewers.forEach((viewers, slug) => {
    viewers.forEach((viewer, id) => {
      if (now - viewer.lastSeen > VIEWER_TIMEOUT) {
        viewers.delete(id);
      }
    });
    if (viewers.size === 0) {
      activeViewers.delete(slug);
    }
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

  if (req.method === 'GET') {
    cleanupViewers();
    const viewers = activeViewers.get(slug) || new Map();
    const count = viewers.size;
    res.setHeader('Cache-Control', 'no-cache');
    return res.status(200).json({ count });
  }

  if (req.method === 'POST') {
    const viewerId = (req.headers['x-viewer-id'] as string) || 
      `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

    // Clean up old viewers first
    cleanupViewers();

    if (!activeViewers.has(slug)) {
      activeViewers.set(slug, new Map());
    }

    const viewers = activeViewers.get(slug)!;
    const now = Date.now();
    
    // Update or add viewer
    viewers.set(viewerId, {
      id: viewerId,
      lastSeen: now,
    });

    // Clean up again after adding (in case we added a stale one)
    cleanupViewers();

    // Get the final count after cleanup
    const finalViewers = activeViewers.get(slug) || new Map();
    const count = finalViewers.size;
    
    console.log(`[Viewers API] POST ${slug}: viewerId=${viewerId}, totalCount=${count}`);
    
    res.setHeader('X-Viewer-ID', viewerId);
    return res.status(200).json({ count, viewerId });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}

