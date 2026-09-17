import './globals.css'
// No share image yet. Drop a 1200x630 app/opengraph-image.png (and the same file as
// app/twitter-image.png) in and Next picks it up on its own — no code needed here.
// metadataBase is what makes that image's URL absolute, and it is baked in at build
// time because this page is statically prerendered, so a runtime env var is too late.
// Preference order: a domain you pin yourself, then Vercel's stable production
// domain, then the per-deployment URL, then local dev.
const host=process.env.VERCEL_PROJECT_PRODUCTION_URL??process.env.VERCEL_URL
const siteUrl=process.env.NEXT_PUBLIC_SITE_URL??(host?`https://${host}`:'http://localhost:3000')
const title='Decision Buddy'
const description="Can't decide? Ask your buddy. Quick, friendly frameworks for the small decisions that eat your day."
export const metadata={
  metadataBase:new URL(siteUrl),
  title,
  description,
  openGraph:{title,description,siteName:title,type:'website',locale:'en'},
  twitter:{card:'summary_large_image',title,description},
}
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="en"><body>{children}</body></html>}
