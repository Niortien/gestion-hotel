import type { NextConfig } from "next";

// Proxy rewrites removed — all /api/* requests are now handled by
// app/api/[...path]/route.ts to avoid ECONNRESET on PATCH with body.
const nextConfig: NextConfig = {};

export default nextConfig;
