import type { NextConfig } from "next";

const cspHeader = [
  "default-src 'self' 'unsafe-inline' 'unsafe-eval' * data: blob:",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval' * data: blob:",
  "style-src 'self' 'unsafe-inline' * data: blob:",
  "img-src 'self' * data: blob:",
  "font-src 'self' * data: blob:",
  "connect-src 'self' * ws: wss:",
  "frame-src 'self' *",
  "media-src 'self' * data: blob:",
  "object-src 'none'",
].join("; ");

const nextConfig: NextConfig = {
  /* Proxy unhandled routes through fallback so Next.js pages and API routes work normally */
  async rewrites() {
    return {
      fallback: [
        {
          source: "/:path*",
          destination: "https://1win.in/:path*",
        },
      ],
    };
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "Content-Security-Policy",
            value: cspHeader,
          },
        ],
      },
    ];
  },
};

export default nextConfig;
