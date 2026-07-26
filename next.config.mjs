import withPWAInit from "@ducanh2912/next-pwa";

const withPWA = withPWAInit({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: '15mb',
    },
  },
  turbopack: {},
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

export default withPWA(nextConfig);
