/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    // Proxy /api/* requests to the HuggingFace Backend Server
    const backendUrl = process.env.BACKEND_API_URL || 'https://fadilah01-pm-boq-fdl.hf.space';

    return [
      {
        source: '/api/:path*',
        destination: `${backendUrl}/api/:path*`,
      },
    ];
  },
};

module.exports = nextConfig;
