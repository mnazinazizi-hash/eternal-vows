/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
    ],
  },
  webpack(config) {
    // jsPDF optionally loads canvg only when exporting SVG artwork. The admin
    // reports do not use that feature, and its optional polyfill dependency is
    // being blocked by Windows Security during bundling.
    config.resolve.alias.canvg = false;

    return config;
  },
};

export default nextConfig;
