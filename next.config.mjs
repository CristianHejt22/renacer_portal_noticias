/** @type {import('next').NextConfig} */
const nextConfig = {
  serverActions: {
    bodySizeLimit: '15mb',
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
      {
        protocol: 'http',
        hostname: '**',
      },
    ],
  },
  async redirects() {
    return [
      {
        source: '/admin/noticias',
        destination: '/admin/posts',
        permanent: true,
      },
      {
        source: '/admin/noticias/:path*',
        destination: '/admin/posts/:path*',
        permanent: true,
      }
    ];
  },
  async rewrites() {
    return {
      fallback: [
        {
          source: '/uploads/:filename*',
          destination: '/api/images/:filename*',
        },
      ],
    };
  }
};

export default nextConfig;
