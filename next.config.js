/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Configure page extensions
  pageExtensions: ["js", "jsx", "ts", "tsx"],
  // Ensure pages are treated as dynamic for Vercel
  output: "standalone",
  // Configure build output
  distDir: ".next",
  // Ensure proper asset handling
  images: {
    domains: ["fightzone-api.onrender.com"],
    unoptimized: true,
  },
  // Enable error overlay in development
  webpack: (config, { dev, isServer }) => {
    // Add error handling for webpack
    if (dev && !isServer) {
      config.devtool = "eval-source-map";
    }
    // Ensure proper handling of node modules
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
    };
    return config;
  },
  // Configure headers for better caching and security
  async headers() {
    return [
      {
        source: "/fonts/:font*",
        headers: [
          {
            key: "Access-Control-Allow-Origin",
            value: "*",
          },
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        source: "/:path*",
        headers: [
          {
            key: "X-DNS-Prefetch-Control",
            value: "on",
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "X-Frame-Options",
            value: "SAMEORIGIN",
          },
          {
            key: "X-XSS-Protection",
            value: "1; mode=block",
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
