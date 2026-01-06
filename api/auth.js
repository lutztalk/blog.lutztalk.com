// Vercel serverless function to handle Decap CMS OAuth proxy
export default async function handler(req, res) {
  const { query } = req;
  const { code, state } = query;

  // Get GitHub OAuth credentials from environment variables
  const GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID;
  const GITHUB_CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET;
  const REDIRECT_URI = `${req.headers['x-forwarded-proto'] || 'https'}://${req.headers.host}/auth`;

  if (!code) {
    // Step 1: Redirect to GitHub for authorization
    const authUrl = `https://github.com/login/oauth/authorize?client_id=${GITHUB_CLIENT_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&scope=repo&state=${state || ''}`;
    return res.redirect(authUrl);
  }

  // Step 2: Exchange code for access token
  try {
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
        redirect_uri: REDIRECT_URI,
      }),
    });

    const tokenData = await tokenResponse.json();
    
    if (tokenData.error) {
      return res.status(400).json({ error: tokenData.error_description || tokenData.error });
    }

    // Step 3: Redirect back to CMS with token
    const callbackUrl = `${REDIRECT_URI}?token=${tokenData.access_token}`;
    return res.redirect(callbackUrl);
  } catch (error) {
    console.error('OAuth error:', error);
    return res.status(500).json({ error: 'Authentication failed' });
  }
}

