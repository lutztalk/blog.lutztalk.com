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

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      return res.status(400).json({ error: 'Invalid email address' });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const redis = getRedis();
    const subscribersKey = 'subscribers:emails';

    // Check if already subscribed
    const isSubscribed = await redis.sismember(subscribersKey, normalizedEmail);

    if (isSubscribed) {
      return res.status(200).json({ 
        success: true, 
        alreadySubscribed: true,
        message: 'Email already subscribed'
      });
    }

    // Add to subscribers set
    await redis.sadd(subscribersKey, normalizedEmail);

    // Store subscription timestamp
    const subscriptionKey = `subscriber:${normalizedEmail}`;
    await redis.set(subscriptionKey, {
      email: normalizedEmail,
      subscribedAt: Date.now(),
      confirmed: false, // For future double-opt-in if needed
    });

    console.log(`[Subscribe] New subscriber: ${normalizedEmail}`);

    return res.status(200).json({ 
      success: true, 
      alreadySubscribed: false,
      message: 'Successfully subscribed'
    });
  } catch (error) {
    console.error('[Subscribe] Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return res.status(500).json({ 
      error: 'Subscription failed',
      details: errorMessage
    });
  }
}

