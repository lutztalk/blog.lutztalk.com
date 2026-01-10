export const config = {
  runtime: 'edge',
};

// Using Vercel KV for persistent storage
// Make sure to set up KV in your Vercel dashboard and install @vercel/kv
export default async function handler(req: Request) {
  const url = new URL(req.url);
  const slug = url.pathname.split('/').pop();

  if (!slug) {
    return new Response(JSON.stringify({ error: 'Slug required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // For now, use a simple in-memory approach
  // In production, use Vercel KV:
  // import { kv } from '@vercel/kv';
  
  if (req.method === 'GET') {
    // Get view count
    // With KV: const count = await kv.get(`views:${slug}`) || 0;
    const count = 0; // Placeholder - will be replaced with KV
    return new Response(JSON.stringify({ count }), {
      headers: { 'Content-Type': 'application/json' },
    });
  }

  if (req.method === 'POST') {
    // Increment view count
    // With KV: 
    //   const count = await kv.incr(`views:${slug}`);
    //   return new Response(JSON.stringify({ count }), {
    //     headers: { 'Content-Type': 'application/json' },
    //   });
    return new Response(JSON.stringify({ count: 0 }), {
      headers: { 'Content-Type': 'application/json' },
    });
  }

  return new Response(JSON.stringify({ error: 'Method not allowed' }), {
    status: 405,
    headers: { 'Content-Type': 'application/json' },
  });
}

