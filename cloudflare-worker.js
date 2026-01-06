/**
 * Cloudflare Worker for Decap CMS OAuth Proxy
 * 
 * To deploy:
 * 1. Install Wrangler: npm install -g wrangler
 * 2. Login: wrangler login
 * 3. Set secrets:
 *    wrangler secret put GITHUB_CLIENT_ID
 *    wrangler secret put GITHUB_CLIENT_SECRET
 * 4. Update the account_id in wrangler.toml (or create it)
 * 5. Deploy: wrangler publish
 */

addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request));
});

async function handleRequest(request) {
  const url = new URL(request.url);
  const path = url.pathname;

  // Get secrets from Cloudflare Workers environment
  const GITHUB_CLIENT_ID = GITHUB_CLIENT_ID; // Set via wrangler secret
  const GITHUB_CLIENT_SECRET = GITHUB_CLIENT_SECRET; // Set via wrangler secret

  // OAuth callback endpoint
  if (path === '/callback') {
    const code = url.searchParams.get('code');
    const state = url.searchParams.get('state');
    
    if (!code) {
      return new Response('Missing code parameter', { status: 400 });
    }

    try {
      // Exchange code for access token
      const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          client_id: GITHUB_CLIENT_ID,
          client_secret: GITHUB_CLIENT_SECRET,
          code: code,
        }),
      });

      const tokenData = await tokenResponse.json();
      
      if (tokenData.error) {
        return new Response(`Error: ${tokenData.error_description || tokenData.error}`, { status: 400 });
      }

      // Redirect back to CMS with token
      const redirectUrl = `https://blog.lutztalk.com/auth?token=${tokenData.access_token}&provider=github`;
      return Response.redirect(redirectUrl, 302);
    } catch (error) {
      return new Response(`Error: ${error.message}`, { status: 500 });
    }
  }

  // Auth initiation endpoint
  if (path === '/auth') {
    const provider = url.searchParams.get('provider') || 'github';
    const siteId = url.searchParams.get('site_id') || 'blog.lutztalk.com';
    const scope = url.searchParams.get('scope') || 'repo';
    
    // Generate state for CSRF protection
    const state = btoa(Math.random().toString(36).substring(7));
    
    // Build GitHub OAuth URL
    const redirectUri = `${url.origin}/callback`;
    const authUrl = `https://github.com/login/oauth/authorize?client_id=${GITHUB_CLIENT_ID}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${scope}&state=${state}`;
    
    return Response.redirect(authUrl, 302);
  }

  return new Response('Not Found', { status: 404 });
}

