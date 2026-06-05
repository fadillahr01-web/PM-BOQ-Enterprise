/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    // In production (Vercel), disable Next.js rewrites so Vercel's serverless function handles /api/*
    if (process.env.NODE_ENV === 'production' || process.env.VERCEL) {
      return [];
    }

    // In local development, proxy /api/* requests to the local backend server
    const backendUrl = process.env.BACKEND_API_URL || 'http://localhost:5001';

    return [
      {
        source: '/api/:path*',
        destination: `${backendUrl}/api/:path*`,
      },
    ];
  },
};

module.exports = nextConfig;
