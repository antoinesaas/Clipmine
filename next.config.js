/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "i.ytimg.com" },
      { protocol: "https", hostname: "img.youtube.com" },
    ],
  },
  reactStrictMode: true,
  async redirects() {
    return [
      {
        source: "/:path*",
        has: [{ type: "host", value: "clipmine.fr" }],
        destination: "https://www.clipmine.fr/:path*",
        permanent: true,
      },
    ];
  },
};
module.exports = nextConfig;
