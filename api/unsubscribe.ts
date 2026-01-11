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
    const { email } = req.body;

    if (!email || typeof email !== 'string') {
      return res.status(400).json({ error: 'Email is required' });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const redis = getRedis();
    const subscribersKey = 'subscribers:emails';

    // Remove from subscribers set
    const removed = await redis.srem(subscribersKey, normalizedEmail);

    // Remove subscription data
    const subscriptionKey = `subscriber:${normalizedEmail}`;
    await redis.del(subscriptionKey);

    if (removed > 0) {
      console.log(`[Unsubscribe] Removed subscriber: ${normalizedEmail}`);
      return res.status(200).json({ 
        success: true,
        message: 'Successfully unsubscribed'
      });
    } else {
      return res.status(200).json({ 
        success: true,
        message: 'Email was not subscribed'
      });
    }
  } catch (error) {
    console.error('[Unsubscribe] Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return res.status(500).json({ 
      error: 'Unsubscribe failed',
      details: errorMessage
    });
  }
}

