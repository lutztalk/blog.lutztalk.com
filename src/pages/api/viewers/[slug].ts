import type { APIRoute } from "astro";

// Track active viewers (last seen within 30 seconds)
interface Viewer {
  id: string;
  lastSeen: number;
}

const activeViewers = new Map<string, Map<string, Viewer>>();
const VIEWER_TIMEOUT = 30000; // 30 seconds

// Clean up old viewers periodically
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now();
    activeViewers.forEach((viewers, slug) => {
      viewers.forEach((viewer, id) => {
        if (now - viewer.lastSeen > VIEWER_TIMEOUT) {
          viewers.delete(id);
        }
      });
      if (viewers.size === 0) {
        activeViewers.delete(slug);
      }
    });
  }, 10000); // Clean up every 10 seconds
}

export const GET: APIRoute = async ({ params }) => {
  const slug = params.slug;
  if (!slug) {
    return new Response(JSON.stringify({ error: "Slug required" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const now = Date.now();
  const viewers = activeViewers.get(slug) || new Map();
  
  // Clean up stale viewers
  viewers.forEach((viewer, id) => {
    if (now - viewer.lastSeen > VIEWER_TIMEOUT) {
      viewers.delete(id);
    }
  });

  const count = viewers.size;
  return new Response(JSON.stringify({ count }), {
    headers: { 
      "Content-Type": "application/json",
      "Cache-Control": "no-cache", // Don't cache active viewers
    },
  });
};

export const POST: APIRoute = async ({ params, request }) => {
  const slug = params.slug;
  if (!slug) {
    return new Response(JSON.stringify({ error: "Slug required" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  // Generate a unique viewer ID
  const viewerId = request.headers.get("x-viewer-id") || 
    `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

  if (!activeViewers.has(slug)) {
    activeViewers.set(slug, new Map());
  }

  const viewers = activeViewers.get(slug)!;
  const now = Date.now();
  
  viewers.set(viewerId, {
    id: viewerId,
    lastSeen: now,
  });

  // Clean up stale viewers
  viewers.forEach((viewer, id) => {
    if (now - viewer.lastSeen > VIEWER_TIMEOUT) {
      viewers.delete(id);
    }
  });

  const count = viewers.size;
  return new Response(JSON.stringify({ count, viewerId }), {
    headers: { 
      "Content-Type": "application/json",
      "X-Viewer-ID": viewerId,
    },
  });
};

