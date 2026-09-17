/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  webpack: (config) => {
    // pdfjs-dist ships a canvas dependency for node target we don't need in browser bundle
    config.resolve.alias.canvas = false;
    return config;
  },
};

module.exports = nextConfig;
