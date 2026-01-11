import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Redis } from '@upstash/redis';

export const prerender = false; // Mark as server-rendered

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

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { webhookUrl } = req.body;

    if (!webhookUrl || typeof webhookUrl !== 'string') {
      return res.status(400).json({ error: 'Webhook URL is required' });
    }

    // Normalize URL
    let normalizedUrl: string;
    try {
      const url = new URL(webhookUrl.trim());
      normalizedUrl = url.href;
    } catch {
      return res.status(400).json({ error: 'Invalid URL format' });
    }

    const redis = getRedis();
    const webhooksKey = 'subscribers:webhooks';

    // Remove from webhooks set
    const removed = await redis.srem(webhooksKey, normalizedUrl);

    // Remove webhook metadata
    const webhookKey = `webhook:${normalizedUrl}`;
    await redis.del(webhookKey);

    if (removed > 0) {
      console.log(`[Unsubscribe Webhook] Removed webhook: ${normalizedUrl}`);
      return res.status(200).json({ 
        success: true,
        message: 'Successfully unsubscribed webhook'
      });
    } else {
      return res.status(200).json({ 
        success: true,
        message: 'Webhook URL was not subscribed'
      });
    }
  } catch (error) {
    console.error('[Unsubscribe Webhook] Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return res.status(500).json({ 
      error: 'Webhook unsubscription failed',
      details: errorMessage
    });
  }
}

