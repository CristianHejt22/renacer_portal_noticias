/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
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
  }
};

export default nextConfig;
