import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Redis } from '@upstash/redis';
import { Resend } from 'resend';

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

// Initialize Resend
function getResend() {
  const apiKey = process.env.RESEND_API_KEY?.trim();

  if (!apiKey) {
    return null;
  }

  return new Resend(apiKey);
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

    // Remove from Resend Audience
    const resend = getResend();
    const audienceId = process.env.RESEND_AUDIENCE_ID?.trim();
    
    if (resend && audienceId && removed > 0) {
      try {
        // Resend doesn't have a direct delete endpoint, but we can mark as unsubscribed
        await resend.contacts.update({
          email: normalizedEmail,
          audienceId: audienceId,
          unsubscribed: true,
        });
        console.log(`[Unsubscribe] Marked ${normalizedEmail} as unsubscribed in Resend Audience`);
      } catch (err) {
        console.error(`[Unsubscribe] Failed to update Resend Audience:`, err);
        // Don't throw - unsubscription should still succeed
      }
    }

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

