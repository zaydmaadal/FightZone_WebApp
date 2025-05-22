/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Configure page extensions
  pageExtensions: ["js", "jsx", "ts", "tsx"],
  // Ensure pages are treated as dynamic
  output: "standalone",
  // Disable automatic static optimization
  typescript: {
    // This ensures pages are treated as dynamic
    ignoreBuildErrors: true,
  },
};

module.exports = nextConfig;
