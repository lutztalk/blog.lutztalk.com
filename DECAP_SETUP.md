# Decap CMS Setup Instructions

## GitHub OAuth App Setup (Required for Production)

To use Decap CMS with GitHub backend, you need to create a GitHub OAuth App:

1. Go to https://github.com/settings/developers
2. Click "New OAuth App"
3. Fill in:
   - **Application name**: LutzTalk Blog CMS
   - **Homepage URL**: https://blog.lutztalk.com
   - **Authorization callback URL**: https://blog.lutztalk.com/auth
4. Click "Register application"
5. Copy the **Client ID** (you'll need this)
6. Generate a **Client Secret** and copy it

## Update config.yml

After creating the OAuth App, update `public/config.yml`:

```yaml
backend:
  name: github
  repo: lutztalk/blog.lutztalk.com
  branch: main
  base_url: https://blog.lutztalk.com
  auth_endpoint: auth
  auth_type: pkce
  auth_scope: repo
  site_id: blog.lutztalk.com
  app_id: YOUR_CLIENT_ID_HERE
```

Replace `YOUR_CLIENT_ID_HERE` with the Client ID from step 5 above.

## Local Development

For local development at `http://localhost:4321`, the CMS should work without a custom OAuth App, but you may need to adjust the `site_id` in the config.

## Accessing the CMS

1. Navigate to `https://blog.lutztalk.com/admin` (or `http://localhost:4321/admin` for local)
2. Click "Login with GitHub" in the header
3. Authorize the application
4. You'll be redirected back and can start creating posts!

