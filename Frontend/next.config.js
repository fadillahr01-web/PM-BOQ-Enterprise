/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    // In development, proxy /api/* requests to the local backend server
    // In production (Vercel), the vercel.json handles routing /api/* to the serverless function
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
