/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [{ protocol: "https", hostname: "i.ytimg.com" }],
  },
  experimental: {
    serverComponentsExternalPackages: [
      "youtube-dl-exec",
      "fluent-ffmpeg",
      "@ffmpeg-installer/ffmpeg",
    ],
  },
};
module.exports = nextConfig;
