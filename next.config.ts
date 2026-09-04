import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Video and media optimization headers
  async headers() {
    return [
      {
        source: "/:all*(mp4|webm|mov|m4v|webp|avif|jpg|jpeg|png)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
          {
            key: "Accept-Ranges",
            value: "bytes",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
