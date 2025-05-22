/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Configure page extensions
  pageExtensions: ["js", "jsx", "ts", "tsx"],
  // Ensure pages are treated as dynamic for Vercel
  output: "standalone",
  // Disable automatic static optimization for dynamic routes
  typescript: {
    // This ensures pages are treated as dynamic
    ignoreBuildErrors: true,
  },
  // Configure build output
  distDir: ".next",
  // Ensure proper asset handling
  images: {
    domains: ["fightzone-api.onrender.com"],
    unoptimized: true,
  },
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
    ];
  },
};

module.exports = nextConfig;
