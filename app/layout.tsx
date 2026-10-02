import "./globals.css";
// jf open 粉圓 (SIL OFL) carries the Chinese — Baloo 2 has no CJK at all. Split into
// unicode-range chunks so a page downloads only the few it needs, which is how full
// coverage stays affordable. Regenerate with scripts/build-font.mjs.
import "./huninn.css";
import { Baloo_2 } from "next/font/google";
// The old stack was ui-rounded / SF Pro Rounded, so the app only looked rounded on
// Apple devices and fell back to plain system-ui everywhere else. Self-hosted through
// next/font: no runtime request to Google, no layout shift. Baloo 2 is round and
// chunky and its axis reaches 800, so the 800/900 weights the design leans on still
// read as heavy — Fredoka is rounder but stops at 700 and flattens that contrast.
// Swapping the family is this one import plus the call below.
const rounded = Baloo_2({
  subsets: ["latin"],
  variable: "--font-rounded",
  display: "swap",
});
// No share image yet. Drop a 1200x630 app/opengraph-image.png (and the same file as
// app/twitter-image.png) in and Next picks it up on its own — no code needed here.
// metadataBase is what makes that image's URL absolute, and it is baked in at build
// time because this page is statically prerendered, so a runtime env var is too late.
// Preference order: a domain you pin yourself, then Vercel's stable production
// domain, then the per-deployment URL, then local dev.
const host =
  process.env.VERCEL_PROJECT_PRODUCTION_URL ?? process.env.VERCEL_URL;
const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (host ? `https://${host}` : "http://localhost:3000");
const title = "Decision Buddy";
const description =
  "還是決定不了？問問你的鴨子夥伴。用輕巧友善的方式，處理那些吃掉你一整天的小決定。";
export const metadata = {
  metadataBase: new URL(siteUrl),
  title,
  description,
  openGraph: {
    title,
    description,
    siteName: title,
    type: "website",
    locale: "zh_TW",
  },
  twitter: { card: "summary_large_image", title, description },
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-Hant-TW" className={rounded.variable}>
      <body>{children}</body>
    </html>
  );
}
