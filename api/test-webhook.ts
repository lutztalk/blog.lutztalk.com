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
  // Require authentication token to prevent unauthorized use
  const authToken = req.headers['x-auth-token'] || req.query.token;
  const expectedToken = process.env.NEWSLETTER_AUTH_TOKEN?.trim();

  if (!expectedToken || authToken !== expectedToken) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { postTitle, postUrl, postDescription } = req.body;

    // Use test data if not provided
    const testPostTitle = postTitle || 'Test Post - Webhook Notification';
    const testPostUrl = postUrl || 'https://blog.lutztalk.com/posts/test';
    const testPostDescription = postDescription || 'This is a test webhook notification';

    const redis = getRedis();
    const webhooksKey = 'subscribers:webhooks';

    // Get all webhook subscribers from Redis
    const webhooks = await redis.smembers<string[]>(webhooksKey) || [];

    if (webhooks.length === 0) {
      return res.status(200).json({ 
        success: true,
        message: 'No webhook subscribers to notify',
        webhooksNotified: 0
      });
    }

    console.log(`[Test Webhook] Found ${webhooks.length} webhook subscribers`);

    // Send webhook notifications
    let webhookSuccessCount = 0;
    let webhookErrorCount = 0;
    const webhookPayload = {
      event: 'new_post',
      post: {
        title: testPostTitle,
        url: testPostUrl,
        description: testPostDescription,
        publishedAt: new Date().toISOString(),
      },
    };

    const results = [];

    for (const webhookUrl of webhooks) {
      try {
        console.log(`[Test Webhook] Sending to ${webhookUrl}...`);
        
        // Create an AbortController for timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

        const response = await fetch(webhookUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'User-Agent': 'LutzTalk-Blog/1.0',
          },
          body: JSON.stringify(webhookPayload),
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (response.ok) {
          webhookSuccessCount++;
          const responseText = await response.text();
          console.log(`[Test Webhook] Successfully sent to ${webhookUrl}, response: ${responseText.substring(0, 100)}`);
          
          results.push({
            url: webhookUrl,
            status: 'success',
            statusCode: response.status,
            response: responseText.substring(0, 200),
          });
          
          // Update webhook metadata
          const webhookKey = `webhook:${webhookUrl}`;
          await redis.set(webhookKey, {
            url: webhookUrl,
            lastNotified: Date.now(),
            failureCount: 0,
          }, { ex: 60 * 60 * 24 * 365 }); // 1 year TTL
        } else {
          webhookErrorCount++;
          const errorText = await response.text();
          console.error(`[Test Webhook] ${webhookUrl} returned status ${response.status}: ${errorText}`);
          
          results.push({
            url: webhookUrl,
            status: 'error',
            statusCode: response.status,
            error: errorText.substring(0, 200),
          });
          
          // Increment failure count
          const webhookKey = `webhook:${webhookUrl}`;
          const webhookData = await redis.get<{ failureCount?: number }>(webhookKey);
          const failureCount = (webhookData?.failureCount || 0) + 1;
          
          if (failureCount >= 5) {
            console.warn(`[Test Webhook] Removing webhook ${webhookUrl} after ${failureCount} failures`);
            await redis.srem(webhooksKey, webhookUrl);
            await redis.del(webhookKey);
          } else {
            await redis.set(webhookKey, {
              url: webhookUrl,
              lastNotified: null,
              failureCount,
            }, { ex: 60 * 60 * 24 * 365 });
          }
        }
      } catch (error) {
        webhookErrorCount++;
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.error(`[Test Webhook] Error sending to ${webhookUrl}:`, errorMessage);
        
        results.push({
          url: webhookUrl,
          status: 'error',
          error: errorMessage,
        });
        
        // Increment failure count
        const webhookKey = `webhook:${webhookUrl}`;
        const webhookData = await redis.get<{ failureCount?: number }>(webhookKey);
        const failureCount = (webhookData?.failureCount || 0) + 1;
        
        if (failureCount >= 5) {
          console.warn(`[Test Webhook] Removing webhook ${webhookUrl} after ${failureCount} failures`);
          await redis.srem(webhooksKey, webhookUrl);
          await redis.del(webhookKey);
        } else {
          await redis.set(webhookKey, {
            url: webhookUrl,
            lastNotified: null,
            failureCount,
          }, { ex: 60 * 60 * 24 * 365 });
        }
      }
    }

    console.log(`[Test Webhook] Sent ${webhookSuccessCount} webhooks, ${webhookErrorCount} errors`);

    return res.status(200).json({ 
      success: true,
      message: 'Webhook test completed',
      webhooksNotified: webhookSuccessCount,
      webhookErrors: webhookErrorCount,
      totalWebhooks: webhooks.length,
      results,
    });
  } catch (error) {
    console.error('[Test Webhook] Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return res.status(500).json({ 
      error: 'Failed to test webhooks',
      details: errorMessage
    });
  }
}

