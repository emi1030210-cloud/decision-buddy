import './globals.css'
import {Baloo_2} from 'next/font/google'
// The old stack was ui-rounded / SF Pro Rounded, so the app only looked rounded on
// Apple devices and fell back to plain system-ui everywhere else. Self-hosted through
// next/font: no runtime request to Google, no layout shift. Baloo 2 is round and
// chunky and its axis reaches 800, so the 800/900 weights the design leans on still
// read as heavy — Fredoka is rounder but stops at 700 and flattens that contrast.
// Swapping the family is this one import plus the call below.
const rounded=Baloo_2({subsets:['latin'],variable:'--font-rounded',display:'swap'})
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
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="en" className={rounded.variable}><body>{children}</body></html>}
