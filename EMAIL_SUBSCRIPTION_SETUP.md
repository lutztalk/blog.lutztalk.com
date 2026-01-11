# Email Subscription Setup Guide

This guide will help you set up email subscriptions for your blog using Resend and Redis.

## Overview

The email subscription system allows readers to:
- Subscribe to receive email notifications when new posts are published
- Unsubscribe at any time
- All subscriber data is stored in your existing Upstash Redis database

## Setup Steps

### 1. Get a Resend API Key

1. Go to [Resend.com](https://resend.com) and create an account
2. Navigate to **API Keys** in the dashboard
3. Click **Create API Key**
4. Give it a name (e.g., "Blog Newsletter")
5. Copy the API key (starts with `re_`)

### 2. Verify Your Domain (Required for `noreply@lutztalk.com`)

**IMPORTANT**: Since you're using `noreply@lutztalk.com`, you must verify the `lutztalk.com` domain:

1. In Resend dashboard, go to **Domains**
2. Click **Add Domain**
3. Enter your domain: `lutztalk.com` (not blog.lutztalk.com)
4. Follow the DNS verification steps:
   - Add the TXT record to your DNS provider
   - Add the MX record (if required)
   - Wait for verification (usually a few minutes)
5. Once verified, you can use `noreply@lutztalk.com`

**Note:** Until your domain is verified, emails will fail. You can temporarily use Resend's test domain (`onboarding@resend.dev`) for testing.

### 3. Set Environment Variables in Vercel

Go to your Vercel project dashboard and add these environment variables:

**Required:**
- `RESEND_API_KEY` - Your Resend API key (e.g., `re_xxxxxxxxxxxxx`)

**Optional (with defaults):**
- `RESEND_FROM_EMAIL` - Email address to send from (default: `noreply@blog.lutztalk.com`)
- `RESEND_FROM_NAME` - Display name for emails (default: `LutzTalk Blog`)
- `RESEND_AUDIENCE_ID` - Your Resend Audience ID (optional - if not set, contacts will be added to the default audience)
- `SITE_URL` - Your site URL (default: `https://blog.lutztalk.com`)
- `NEWSLETTER_AUTH_TOKEN` - Secret token to protect the send-newsletter endpoint (generate a random string)

### 4. Generate Newsletter Auth Token

Generate a secure random token for the newsletter sending endpoint:

```bash
# On macOS/Linux:
openssl rand -hex 32

# Or use an online generator
```

Add this as `NEWSLETTER_AUTH_TOKEN` in Vercel.

## How It Works

### Subscribing

1. Users enter their email in the subscription form (on homepage or footer)
2. Email is stored in Redis set: `subscribers:emails`
3. Email is added to Resend Audience (if `RESEND_AUDIENCE_ID` is configured)
4. Subscription metadata is stored: `subscriber:{email}`

### Sending Newsletters

When you publish a new post, you can trigger an email to all subscribers:

**Option 1: Manual Trigger (via API)**

```bash
curl -X POST https://blog.lutztalk.com/api/send-newsletter \
  -H "Content-Type: application/json" \
  -H "X-Auth-Token: YOUR_NEWSLETTER_AUTH_TOKEN" \
  -d '{
    "postTitle": "My New Post Title",
    "postUrl": "https://blog.lutztalk.com/posts/my-new-post",
    "postDescription": "Optional description of the post"
  }'
```

**Option 2: Storyblok Webhook (Recommended)**

1. Go to Storyblok → Settings → Webhooks
2. Create a new webhook
3. Set URL: `https://blog.lutztalk.com/api/send-newsletter?token=YOUR_NEWSLETTER_AUTH_TOKEN`
4. Set Method: `POST`
5. Set Trigger: `Story published`
6. Set Payload (JSON):
```json
{
  "postTitle": "{{story.name}}",
  "postUrl": "https://blog.lutztalk.com/posts/{{story.slug}}",
  "postDescription": "{{story.content.description}}"
}
```

**Option 3: Manual Script**

You can create a simple script to send newsletters:

```javascript
// send-newsletter.js
const response = await fetch('https://blog.lutztalk.com/api/send-newsletter', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-Auth-Token': process.env.NEWSLETTER_AUTH_TOKEN,
  },
  body: JSON.stringify({
    postTitle: 'Your Post Title',
    postUrl: 'https://blog.lutztalk.com/posts/your-slug',
    postDescription: 'Optional description',
  }),
});

const data = await response.json();
console.log(data);
```

### Unsubscribing

Users can unsubscribe by:
1. Clicking the unsubscribe link in any newsletter email
2. Visiting `/unsubscribe` and entering their email

## Data Storage

All subscription data is stored in your existing Upstash Redis database:

- **Subscribers Set**: `subscribers:emails` - Contains all subscriber email addresses
- **Subscriber Metadata**: `subscriber:{email}` - Contains subscription details (timestamp, confirmation status, etc.)

## Testing

1. **Test Subscription:**
   - Visit your homepage
   - Enter a test email in the subscription form
   - Check Redis to verify the email was added

2. **Test Newsletter:**
   - Use the manual API call above with a test email
   - Check your inbox (or Resend dashboard → Logs)

3. **Test Unsubscribe:**
   - Visit `/unsubscribe?email=your@test.com`
   - Verify the email is removed from Redis

## Troubleshooting

### Emails Not Sending

1. Check Resend dashboard → Logs for error messages
2. Verify `RESEND_API_KEY` is set correctly in Vercel
3. Make sure your domain is verified (if using custom domain)
4. Check Vercel function logs for errors

### Subscriptions Not Working

1. Verify Redis environment variables are set (`KV_REST_API_URL`, `KV_REST_API_TOKEN`)
2. Check Vercel function logs
3. Test the `/api/subscribe` endpoint directly

### Newsletter Endpoint Returns 401

- Make sure `NEWSLETTER_AUTH_TOKEN` is set in Vercel
- Verify you're sending the token in the `X-Auth-Token` header or `?token=` query param

## Rate Limits

- **Resend Free Tier**: 3,000 emails/month, 100 emails/day
- **Resend Pro Tier**: Higher limits available

## Security Notes

- The newsletter sending endpoint requires authentication via `NEWSLETTER_AUTH_TOKEN`
- Never commit API keys or tokens to git
- Use environment variables for all sensitive data
- Consider implementing rate limiting for the subscribe endpoint to prevent abuse

