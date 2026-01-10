import type { APIRoute } from "astro";

// Simple in-memory store (resets on deploy)
// For production persistence, consider using Vercel KV, Upstash, or a database
const viewCounts = new Map<string, number>();

export const GET: APIRoute = async ({ params }) => {
  const slug = params.slug;
  if (!slug) {
    return new Response(JSON.stringify({ error: "Slug required" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const count = viewCounts.get(slug) || 0;
  return new Response(JSON.stringify({ count }), {
    headers: { 
      "Content-Type": "application/json",
      "Cache-Control": "public, max-age=30", // Cache for 30 seconds
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

  // Increment view count
  const current = viewCounts.get(slug) || 0;
  viewCounts.set(slug, current + 1);

  return new Response(JSON.stringify({ count: current + 1 }), {
    headers: { "Content-Type": "application/json" },
  });
};

