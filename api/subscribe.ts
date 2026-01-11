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
    // Don't throw error - email sending is optional
    return null;
  }

  return new Resend(apiKey);
}

// Send welcome email
async function sendWelcomeEmail(email: string) {
  const resend = getResend();
  if (!resend) {
    console.log('[Subscribe] Resend not configured, skipping welcome email');
    return;
  }

  const siteUrl = process.env.SITE_URL || 'https://blog.lutztalk.com';
  const fromEmail = process.env.RESEND_FROM_EMAIL || 'noreply@blog.lutztalk.com';
  const fromName = process.env.RESEND_FROM_NAME || 'LutzTalk Blog';

  const emailHtml = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f5f5f5;">
        <div style="background-color: #ffffff; padding: 30px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <h1 style="color: #000; margin-top: 0; font-size: 24px;">Welcome to LutzTalk!</h1>
          <p style="color: #666; font-size: 16px; margin: 20px 0;">
            Thanks for subscribing! You'll now receive email notifications whenever a new post is published.
          </p>
          <p style="color: #666; font-size: 16px; margin: 20px 0;">
            I write about AI, 5G, collaboration platforms, networking, and live broadcasting from the lens of real-world use, experimentation, and lessons learned.
          </p>
          <a href="${siteUrl}" style="display: inline-block; background-color: #000; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 4px; margin: 20px 0; font-weight: 500;">Visit the Blog</a>
          <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
          <p style="color: #999; font-size: 12px; margin: 0;">
            You're receiving this because you subscribed to updates from LutzTalk.<br>
            <a href="${siteUrl}/unsubscribe?email=${encodeURIComponent(email)}" style="color: #999;">Unsubscribe</a>
          </p>
        </div>
      </body>
    </html>
  `;

  const emailText = `
Welcome to LutzTalk!

Thanks for subscribing! You'll now receive email notifications whenever a new post is published.

I write about AI, 5G, collaboration platforms, networking, and live broadcasting from the lens of real-world use, experimentation, and lessons learned.

Visit the blog: ${siteUrl}

---
You're receiving this because you subscribed to updates from LutzTalk.
Unsubscribe: ${siteUrl}/unsubscribe?email=${encodeURIComponent(email)}
  `.trim();

  try {
    const result = await resend.emails.send({
      to: email,
      from: `${fromName} <${fromEmail}>`,
      subject: 'Welcome to LutzTalk!',
      html: emailHtml,
      text: emailText,
    });
    console.log(`[Subscribe] Welcome email sent to ${email}`, result);
    return result;
  } catch (error) {
    console.error(`[Subscribe] Error sending welcome email to ${email}:`, error);
    // Log detailed error information
    if (error && typeof error === 'object' && 'message' in error) {
      const err = error as { message?: string; statusCode?: number };
      console.error(`[Subscribe] Resend error details:`, {
        message: err.message,
        statusCode: err.statusCode,
        email,
        fromEmail,
      });
    }
    // Don't throw - subscription should still succeed even if email fails
    // Re-throw so the caller can log it, but wrap in a way that won't break the subscription
    return null;
  }
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

    // Send welcome email (don't await - send in background)
    sendWelcomeEmail(normalizedEmail).catch(err => {
      console.error(`[Subscribe] Failed to send welcome email:`, err);
      // Log detailed error for debugging
      if (err instanceof Error) {
        console.error(`[Subscribe] Error details:`, {
          message: err.message,
          stack: err.stack,
          email: normalizedEmail,
        });
      }
    });

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

