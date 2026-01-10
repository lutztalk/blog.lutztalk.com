export const config = {
  runtime: 'edge',
};

// Using Vercel KV for persistent storage
const VIEWER_TIMEOUT = 30000; // 30 seconds

export default async function handler(req: Request) {
  const url = new URL(req.url);
  const slug = url.pathname.split('/').pop();

  if (!slug) {
    return new Response(JSON.stringify({ error: 'Slug required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const viewerId = req.headers.get('x-viewer-id') || 
    `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

  if (req.method === 'GET') {
    // Get active viewers count
    // With KV: 
    //   const viewers = await kv.zrange(`viewers:${slug}`, 0, -1, { withScores: true });
    //   const now = Date.now();
    //   const active = viewers.filter(([_, timestamp]) => now - timestamp < VIEWER_TIMEOUT);
    //   return new Response(JSON.stringify({ count: active.length }), {
    //     headers: { 'Content-Type': 'application/json' },
    //   });
    return new Response(JSON.stringify({ count: 0 }), {
      headers: { 'Content-Type': 'application/json' },
    });
  }

  if (req.method === 'POST') {
    // Update viewer activity
    const now = Date.now();
    
    // With KV:
    //   await kv.zadd(`viewers:${slug}`, now, viewerId);
    //   await kv.expire(`viewers:${slug}`, 60); // Clean up after 60 seconds
    //   
    //   // Get active viewers
    //   const viewers = await kv.zrange(`viewers:${slug}`, 0, -1, { withScores: true });
    //   const active = viewers.filter(([_, timestamp]) => now - timestamp < VIEWER_TIMEOUT);
    //   
    //   return new Response(JSON.stringify({ count: active.length, viewerId }), {
    //     headers: { 'Content-Type': 'application/json', 'X-Viewer-ID': viewerId },
    //   });

    return new Response(JSON.stringify({ count: 1, viewerId }), {
      headers: { 'Content-Type': 'application/json', 'X-Viewer-ID': viewerId },
    });
  }

  return new Response(JSON.stringify({ error: 'Method not allowed' }), {
    status: 405,
    headers: { 'Content-Type': 'application/json' },
  });
}

