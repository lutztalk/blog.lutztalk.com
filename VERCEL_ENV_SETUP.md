# Vercel Environment Variables Setup

## Required Environment Variables

Set these in your Vercel project dashboard:

### 1. Resend API Key
```
RESEND_API_KEY=re_4tx8KYDS_3VokSLtuUDnnt5qbRjzTya81
```

### 2. Resend Email Configuration
```
RESEND_FROM_EMAIL=noreply@lutztalk.com
RESEND_FROM_NAME=LutzTalk Blog
```

### 3. Newsletter Auth Token (Generated)
```
NEWSLETTER_AUTH_TOKEN=48c4e9ed9d8e5a005821294b6c5714d96e775b5d5320825b63e405e2c9219055
```

### 4. Site URL (Optional - defaults to https://blog.lutztalk.com)
```
SITE_URL=https://blog.lutztalk.com
```

## How to Set in Vercel

1. Go to your Vercel project dashboard: https://vercel.com/dashboard
2. Select your `blog.lutztalk.com` project
3. Go to **Settings** → **Environment Variables**
4. Add each variable:
   - **Key**: `RESEND_API_KEY`
   - **Value**: `re_4tx8KYDS_3VokSLtuUDnnt5qbRjzTya81`
   - **Environment**: Select all (Production, Preview, Development)
   - Click **Save**
   
   Repeat for each variable.

5. After adding all variables, **redeploy** your project:
   - Go to **Deployments**
   - Click the three dots (⋯) on the latest deployment
   - Click **Redeploy**

## Important Notes

⚠️ **Security Warning**: The API key above has been shared. For production, consider:
- Rotating the key in Resend dashboard if this was shared publicly
- Using Vercel's environment variable encryption
- Never committing API keys to git

## Testing

After setting the variables and redeploying:

1. Visit your blog homepage
2. Try subscribing with a test email
3. Check Vercel function logs to verify it's working
4. Test the newsletter endpoint (see EMAIL_SUBSCRIPTION_SETUP.md)

