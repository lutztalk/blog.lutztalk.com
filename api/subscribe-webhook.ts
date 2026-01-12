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

    // Validate URL
    let normalizedUrl: string;
    try {
      const url = new URL(webhookUrl.trim());
      normalizedUrl = url.href; // Normalize URL (removes trailing slashes, etc.)
    } catch {
      return res.status(400).json({ error: 'Invalid URL format' });
    }

    // Only allow http:// or https://
    if (!normalizedUrl.startsWith('http://') && !normalizedUrl.startsWith('https://')) {
      return res.status(400).json({ error: 'URL must start with http:// or https://' });
    }

    const redis = getRedis();
    const webhooksKey = 'subscribers:webhooks';

    // Check if already subscribed
    const isSubscribed = await redis.sismember(webhooksKey, normalizedUrl);

    if (isSubscribed) {
      return res.status(200).json({ 
        success: true, 
        alreadySubscribed: true,
        message: 'Webhook URL already subscribed'
      });
    }

    // Add to webhooks set
    await redis.sadd(webhooksKey, normalizedUrl);

    // Store webhook metadata
    const webhookKey = `webhook:${normalizedUrl}`;
    await redis.set(webhookKey, {
      url: normalizedUrl,
      subscribedAt: Date.now(),
      lastNotified: null,
      failureCount: 0,
    });

    console.log(`[Subscribe Webhook] New webhook subscriber: ${normalizedUrl}`);

    // Send a "thanks for subscribing" webhook notification
    try {
      const welcomePayload = {
        event: 'webhook_subscribed',
        message: 'Thanks for subscribing! You will receive notifications when new posts are published.',
        subscribedAt: new Date().toISOString(),
      };

      console.log(`[Subscribe Webhook] Sending welcome notification to ${normalizedUrl}...`);
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

      const response = await fetch(normalizedUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'LutzTalk-Blog/1.0',
        },
        body: JSON.stringify(welcomePayload),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        console.log(`[Subscribe Webhook] Welcome notification sent successfully to ${normalizedUrl}`);
        await redis.set(webhookKey, {
          url: normalizedUrl,
          subscribedAt: Date.now(),
          lastNotified: Date.now(),
          failureCount: 0,
        });
      } else {
        const errorText = await response.text().catch(() => '');
        console.warn(`[Subscribe Webhook] Welcome notification to ${normalizedUrl} returned status ${response.status}: ${errorText.substring(0, 200)}`);
        // Don't fail the subscription if the welcome webhook fails
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.warn(`[Subscribe Webhook] Error sending welcome notification to ${normalizedUrl}:`, errorMessage);
      // Don't fail the subscription if the welcome webhook fails
    }

    return res.status(200).json({ 
      success: true, 
      alreadySubscribed: false,
      message: 'Successfully subscribed webhook'
    });
  } catch (error) {
    console.error('[Subscribe Webhook] Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return res.status(500).json({ 
      error: 'Webhook subscription failed',
      details: errorMessage
    });
  }
}

