import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Redis } from '@upstash/redis';
import { Resend } from 'resend';

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
    throw new Error('RESEND_API_KEY environment variable is required.');
  }

  return new Resend(apiKey);
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

    if (!postTitle || !postUrl) {
      return res.status(400).json({ error: 'postTitle and postUrl are required' });
    }

    const redis = getRedis();
    const resend = getResend();
    const subscribersKey = 'subscribers:emails';
    const webhooksKey = 'subscribers:webhooks';

    // Get all email subscribers from Redis (source of truth)
    // Note: We pull from Redis, not Resend Audience, to ensure we send to all subscribers
    const subscribers = await redis.smembers<string[]>(subscribersKey) || [];
    
    // Get all webhook subscribers from Redis
    const webhooks = await redis.smembers<string[]>(webhooksKey) || [];

    if (subscribers.length === 0 && webhooks.length === 0) {
      return res.status(200).json({ 
        success: true,
        message: 'No subscribers to notify',
        sent: 0,
        webhooksNotified: 0
      });
    }

    const siteUrl = process.env.SITE_URL || 'https://blog.lutztalk.com';
    const fromEmail = process.env.RESEND_FROM_EMAIL || 'blog@blog.lutztalk.com';
    const fromName = process.env.RESEND_FROM_NAME || 'LutzTalk Blog';

    // Create email content
    const emailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f5f5f5;">
          <div style="background-color: #ffffff; padding: 30px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            <h1 style="color: #000; margin-top: 0; font-size: 24px;">New Post: ${postTitle}</h1>
            ${postDescription ? `<p style="color: #666; font-size: 16px; margin: 20px 0;">${postDescription}</p>` : ''}
            <a href="${postUrl}" style="display: inline-block; background-color: #000; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 4px; margin: 20px 0; font-weight: 500;">Read the post</a>
            <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
            <p style="color: #999; font-size: 12px; margin: 0;">
              You're receiving this because you subscribed to updates from LutzTalk.<br>
              <a href="${siteUrl}/unsubscribe?email={{email}}" style="color: #999;">Unsubscribe</a>
            </p>
          </div>
        </body>
      </html>
    `;

    const emailText = `
New Post: ${postTitle}

${postDescription || ''}

Read the post: ${postUrl}

---
You're receiving this because you subscribed to updates from LutzTalk.
Unsubscribe: ${siteUrl}/unsubscribe?email={{email}}
    `.trim();

    // Send emails in batches (Resend allows up to 50 recipients per batch)
    const batchSize = 50;
    let sentCount = 0;
    let errorCount = 0;

    for (let i = 0; i < subscribers.length; i += batchSize) {
      const batch = subscribers.slice(i, i + batchSize);
      
      try {
        // Replace {{email}} placeholder with actual email for each recipient
        const emails = batch.map(email => ({
          to: email,
          subject: `New Post: ${postTitle}`,
          html: emailHtml.replace(/\{\{email\}\}/g, email),
          text: emailText.replace(/\{\{email\}\}/g, email),
          from: `${fromName} <${fromEmail}>`,
        }));

        // Send batch
        for (const emailData of emails) {
          try {
            await resend.emails.send(emailData);
            sentCount++;
          } catch (emailError) {
            console.error(`[Newsletter] Error sending to ${emailData.to}:`, emailError);
            errorCount++;
          }
        }
      } catch (batchError) {
        console.error(`[Newsletter] Error sending batch:`, batchError);
        errorCount += batch.length;
      }
    }

    console.log(`[Newsletter] Sent ${sentCount} emails, ${errorCount} errors`);

    // Send webhook notifications
    let webhookSuccessCount = 0;
    let webhookErrorCount = 0;
    const webhookPayload = {
      event: 'new_post',
      post: {
        title: postTitle,
        url: postUrl,
        description: postDescription || null,
        publishedAt: new Date().toISOString(),
      },
    };

    for (const webhookUrl of webhooks) {
      try {
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
          
          // Update webhook metadata
          const webhookKey = `webhook:${webhookUrl}`;
          await redis.set(webhookKey, {
            url: webhookUrl,
            lastNotified: Date.now(),
            failureCount: 0,
          }, { ex: 60 * 60 * 24 * 365 }); // 1 year TTL
          
          console.log(`[Newsletter] Webhook notification sent to ${webhookUrl}`);
        } else {
          webhookErrorCount++;
          console.error(`[Newsletter] Webhook ${webhookUrl} returned status ${response.status}`);
          
          // Increment failure count
          const webhookKey = `webhook:${webhookUrl}`;
          const webhookData = await redis.get<{ failureCount?: number }>(webhookKey);
          const failureCount = (webhookData?.failureCount || 0) + 1;
          
          // If too many failures, remove webhook (optional - you might want to keep it)
          if (failureCount >= 5) {
            console.warn(`[Newsletter] Removing webhook ${webhookUrl} after ${failureCount} failures`);
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
        console.error(`[Newsletter] Error sending webhook to ${webhookUrl}:`, error);
        
        // Increment failure count
        const webhookKey = `webhook:${webhookUrl}`;
        const webhookData = await redis.get<{ failureCount?: number }>(webhookKey);
        const failureCount = (webhookData?.failureCount || 0) + 1;
        
        // If too many failures, remove webhook
        if (failureCount >= 5) {
          console.warn(`[Newsletter] Removing webhook ${webhookUrl} after ${failureCount} failures`);
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

    console.log(`[Newsletter] Notified ${webhookSuccessCount} webhooks, ${webhookErrorCount} errors`);

    return res.status(200).json({ 
      success: true,
      message: 'Newsletter sent',
      sent: sentCount,
      errors: errorCount,
      total: subscribers.length,
      webhooksNotified: webhookSuccessCount,
      webhookErrors: webhookErrorCount,
      totalWebhooks: webhooks.length
    });
  } catch (error) {
    console.error('[Newsletter] Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return res.status(500).json({ 
      error: 'Failed to send newsletter',
      details: errorMessage
    });
  }
}

