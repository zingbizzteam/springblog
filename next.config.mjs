

const nextConfig = {
  images: {
    // Allow all external domains (use with caution in production)
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
    // Alternative: Set unoptimized to true to bypass Next.js image optimization
    // unoptimized: true,
  },
};

export default nextConfig;
