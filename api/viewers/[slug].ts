import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Redis } from '@upstash/redis';

// Initialize Redis from environment variables
function getRedis() {
  const url = process.env.KV_REST_API_URL?.trim();
  const token = process.env.KV_REST_API_TOKEN?.trim();

  if (!url || !token) {
    throw new Error('Redis environment variables not set. KV_REST_API_URL and KV_REST_API_TOKEN are required.');
  }

  return new Redis({
    url,
    token,
  });
}

const VIEWER_TIMEOUT = 30000; // 30 seconds (in milliseconds)
const VIEWER_TTL = 35; // TTL in seconds (slightly longer than timeout for cleanup buffer)

// Clean up old viewers from Redis
async function cleanupViewers(redis: Redis, slug: string): Promise<number> {
  const now = Date.now();
  const viewerSetKey = `viewers:${slug}:set`;
  
  // Get all viewer IDs from the set
  const viewerIds = await redis.smembers<string[]>(viewerSetKey) || [];
  
  if (viewerIds.length === 0) {
    return 0;
  }
  
  // Check each viewer's last seen time and remove stale ones
  const activeViewerIds: string[] = [];
  const viewerKeyPrefix = `viewers:${slug}:`;
  
  for (const viewerId of viewerIds) {
    const viewerKey = `${viewerKeyPrefix}${viewerId}`;
    const lastSeen = await redis.get<number>(viewerKey);
    
    if (lastSeen && typeof lastSeen === 'number') {
      const age = now - lastSeen;
      if (age < VIEWER_TIMEOUT) {
        activeViewerIds.push(viewerId);
      } else {
        // Remove stale viewer
        await redis.del(viewerKey);
        await redis.srem(viewerSetKey, viewerId);
        console.log(`[Viewers API] Cleaned up stale viewer ${viewerId} for slug ${slug}`);
      }
    } else {
      // Viewer key doesn't exist or expired, remove from set
      await redis.srem(viewerSetKey, viewerId);
    }
  }
  
  return activeViewerIds.length;
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

  try {
    const redis = getRedis();
    const viewerSetKey = `viewers:${slug}:set`;

    if (req.method === 'GET') {
      // Clean up and get count
      const count = await cleanupViewers(redis, slug);
      console.log(`[Viewers API] GET ${slug}: count=${count}`);
      res.setHeader('Cache-Control', 'no-cache');
      return res.status(200).json({ count });
    }

    if (req.method === 'POST') {
      const viewerId = (req.headers['x-viewer-id'] as string);
      
      if (!viewerId) {
        return res.status(400).json({ error: 'X-Viewer-ID header required' });
      }

      // Check if this is a removal request (from page unload)
      // Can come from query param or body
      const isRemoval = req.query.remove === 'true' || 
                       (req.body && typeof req.body === 'object' && 'viewerId' in req.body);
      
      if (isRemoval) {
        // Remove viewer immediately
        const viewerKey = `viewers:${slug}:${viewerId}`;
        await redis.del(viewerKey);
        await redis.srem(viewerSetKey, viewerId);
        const count = await cleanupViewers(redis, slug);
        console.log(`[Viewers API] REMOVE ${slug}: viewerId=${viewerId}, remainingCount=${count}`);
        return res.status(200).json({ count, removed: true });
      }

      const now = Date.now();
      const viewerKey = `viewers:${slug}:${viewerId}`;
      
      // Update viewer's last seen time with TTL
      await redis.set(viewerKey, now, { ex: VIEWER_TTL });
      
      // Add viewer ID to the set (also with TTL, but we'll manage it manually)
      await redis.sadd(viewerSetKey, viewerId);
      await redis.expire(viewerSetKey, VIEWER_TTL); // Refresh set TTL
      
      // Clean up stale viewers and get accurate count
      const count = await cleanupViewers(redis, slug);
      
      console.log(`[Viewers API] POST ${slug}: viewerId=${viewerId}, totalCount=${count}`);
      
      res.setHeader('X-Viewer-ID', viewerId);
      return res.status(200).json({ count, viewerId });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('[Viewers API] Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('[Viewers API] Error details:', {
      message: errorMessage,
      hasUrl: !!process.env.KV_REST_API_URL,
      hasToken: !!process.env.KV_REST_API_TOKEN,
      slug,
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
