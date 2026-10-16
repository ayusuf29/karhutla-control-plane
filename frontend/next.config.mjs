/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  transpilePackages: ['@deck.gl/core', '@deck.gl/layers', '@deck.gl/geo-layers', '@deck.gl/react'],
  webpack: (config) => {
    config.resolve.fallback = { fs: false, path: false };
    return config;
  },
  async rewrites() {
    const backendUrl = process.env.INTERNAL_BACKEND_URL || 'http://sentinel-backend:8080';
    return [
      {
        source: '/api/:path*',
        destination: `${backendUrl}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
