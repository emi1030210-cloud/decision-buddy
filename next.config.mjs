/** @type {import('next').NextConfig} */

// Next hashes its own build output and serves it immutable for a year. Anything in
// public/ it serves with `max-age=0, must-revalidate`, which is the safe default for
// files whose names never change — but it means a round trip to the CDN before the
// font can be used, on every page load, measured at ~40ms from a fast connection and
// worse on mobile. With `font-display: swap` that is a flash of the fallback face on
// every visit rather than a block, which is exactly the mismatch the Chinese face was
// added to avoid.
//
// scripts/build-font.mjs puts a content hash in each chunk's filename, so a changed
// font is a different URL and `immutable` is safe. The hash is what makes this rule
// correct; do not widen it to files whose names are stable.
const nextConfig = {
  async headers() {
    return [
      {
        source: "/fonts/:file(huninn-\\d+\\.[a-f0-9]+\\.woff2)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
