/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'yzoqnqubnwoijrwtdroj.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
  async redirects() {
    return [
      {
        source: '/events',
        destination: '/tournaments',
        permanent: true,
      },
      {
        source: '/tournament-results',
        destination: '/tournaments?tab=standings',
        permanent: true,
      },
      {
        source: '/tournament-rules',
        destination: '/tournaments?tab=rules',
        permanent: true,
      },
      {
        source: '/videos',
        destination: '/gallery?tab=videos',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
