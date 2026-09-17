import { ImageResponse } from "next/og";

export const ogAlt = "Decision Buddy — a pocket-sized decision pal";
export const ogSize = { width: 1200, height: 630 };
export const ogContentType = "image/png";

// The duck, as the favicon draws it. Satori renders <img> from a data URI far
// more reliably than it lays out a pile of nested rounded divs.
const duck = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
  <ellipse cx="15" cy="18" rx="11" ry="10" fill="#f6d765"/>
  <path d="M15 8c1.6-.4 2.6.6 2.2 2.2-.5 1.7-2.4 1.6-2.9.2-.3-1 .1-2.1.7-2.4z" fill="#f6d765"/>
  <circle cx="11.5" cy="16" r="1.5" fill="#403a2f"/>
  <circle cx="18.5" cy="16" r="1.5" fill="#403a2f"/>
  <ellipse cx="15" cy="21.5" rx="4.2" ry="3" fill="#e99c2e"/>
  <path d="M11.5 21.6h7" stroke="#8a5a0c" stroke-opacity=".3" stroke-width="1" stroke-linecap="round"/>
</svg>`;
const duckSrc = `data:image/svg+xml;base64,${Buffer.from(duck).toString("base64")}`;

// Satori's built-in font only ships a regular weight, and this app's whole look is
// heavy rounded type. Nunito 800 is the closest free match. Fetched at build time
// rather than committed as a binary; if it ever fails the image still renders, just
// lighter, so a font outage can never break the build.
async function boldFont() {
  try {
    const css = await fetch(
      "https://fonts.googleapis.com/css2?family=Nunito:wght@800&display=swap",
      { headers: { "User-Agent": "Mozilla/5.0" } },
    ).then((r) => r.text());
    const url = css.match(
      /src:\s*url\((https:[^)]+\.(?:ttf|otf|woff2?))\)/,
    )?.[1];
    if (!url) return [];
    const data = await fetch(url).then((r) => r.arrayBuffer());
    return [
      { name: "Nunito", data, weight: 800 as const, style: "normal" as const },
    ];
  } catch {
    return [];
  }
}

export async function renderOgImage() {
  const fonts = await boldFont();
  const font = fonts.length ? "Nunito" : undefined;
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: "#fffaf0",
        color: "#403a2f",
        fontFamily: font,
        // the page's dot pattern, at a size that survives downscaling in a feed
        backgroundImage: "radial-gradient(#eadfce 2px, transparent 2px)",
        backgroundSize: "48px 48px",
      }}
    >
      <img src={duckSrc} width={200} height={200} alt="" />
      <div
        style={{
          fontSize: 104,
          fontWeight: 800,
          letterSpacing: "-0.05em",
          color: "#b88308",
          marginTop: 8,
        }}
      >
        Can&apos;t decide?
      </div>
      <div style={{ fontSize: 40, color: "#756e60", marginTop: 12 }}>
        It&apos;s okay. That&apos;s literally why I&apos;m here.
      </div>
      <div
        style={{
          display: "flex",
          gap: 18,
          marginTop: 44,
          fontSize: 30,
          fontWeight: 700,
          color: "#5d5547",
        }}
      >
        <span>🍜 Eat</span>
        <span>🛍️ Buy</span>
        <span>🔥 Do first</span>
        <span>⚖️ Choose</span>
      </div>
    </div>,
    { ...ogSize, fonts },
  );
}
