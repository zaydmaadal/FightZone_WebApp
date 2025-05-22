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
};

module.exports = nextConfig;
