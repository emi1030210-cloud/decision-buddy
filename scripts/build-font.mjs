// Splits jf open 粉圓 into unicode-range chunks, the way Google Fonts serves CJK.
// The browser downloads only the chunks holding characters actually on the page,
// so full coverage costs a small first load instead of one 2 MB file.
//
//   node scripts/build-font.mjs path/to/jf-openhuninn-2.1.ttf
//
// Writes public/fonts/huninn-*.woff2 and app/huninn.css.
import { execFileSync } from "node:child_process";
import { mkdirSync, writeFileSync, readFileSync, readdirSync, rmSync, statSync } from "node:fs";
import { join } from "node:path";

const src = process.argv[2];
if (!src) throw new Error("usage: node scripts/build-font.mjs <font.ttf>");

const OUT = "public/fonts";
const CHUNK = 800; // codepoints per chunk

rmSync(OUT, { recursive: true, force: true });
mkdirSync(OUT, { recursive: true });

// every codepoint the font actually covers
const cps = JSON.parse(
  execFileSync("python3", ["-c", `
from fontTools.ttLib import TTFont
import json,sys
print(json.dumps(sorted(TTFont(sys.argv[1]).getBestCmap())))
`, src]).toString(),
);

// Chunk 0 holds everything a normal page needs: Latin, punctuation, every character
// in the app's own copy, and a list of everyday Chinese. Splitting purely by codepoint
// would scatter common characters across every chunk and a single Chinese page would
// pull all of them, which is exactly what this is meant to avoid.
const uiText = readdirSync("components").filter((f) => f.endsWith(".tsx"))
  .map((f) => readFileSync(join("components", f), "utf8"))
  .concat(["app/layout.tsx", "app/page.tsx", "lib/decisions.ts"].map((f) => readFileSync(f, "utf8")))
  .join("");
const everyday = readFileSync("scripts/common-zh.txt", "utf8");
const hot = new Set([...(uiText + everyday)].map((c) => c.codePointAt(0)));

const base = cps.filter((c) => c < 0x4e00 || c > 0x9fff || hot.has(c));
const rest = cps.filter((c) => c >= 0x4e00 && c <= 0x9fff && !hot.has(c));
const groups = [base];
for (let i = 0; i < rest.length; i += CHUNK) groups.push(rest.slice(i, i + CHUNK));

const faces = [];
groups.forEach((g, i) => {
  if (!g.length) return;
  const text = g.map((c) => String.fromCodePoint(c)).join("");
  writeFileSync("/tmp/chunk.txt", text, "utf8");
  const file = `huninn-${i}.woff2`;
  execFileSync("pyftsubset", [
    src, "--text-file=/tmp/chunk.txt", `--output-file=${join(OUT, file)}`,
    "--flavor=woff2", "--layout-features=*", "--no-hinting", "--desubroutinize",
  ]);
  // collapse consecutive codepoints into ranges so the header stays small
  const ranges = [];
  let start = g[0], prev = g[0];
  for (const c of g.slice(1)) {
    if (c !== prev + 1) { ranges.push([start, prev]); start = c; }
    prev = c;
  }
  ranges.push([start, prev]);
  const hex = (n) => "U+" + n.toString(16).toUpperCase();
  const range = ranges.map(([a, b]) => (a === b ? hex(a) : `${hex(a)}-${b.toString(16).toUpperCase()}`)).join(",");
  faces.push(`@font-face{font-family:'huninn';font-style:normal;font-weight:400 900;font-display:swap;src:url('/fonts/${file}') format('woff2');unicode-range:${range}}`);
});

writeFileSync("app/huninn.css", faces.join("\n") + "\n", "utf8");

const total = readdirSync(OUT).reduce((n, f) => n + statSync(join(OUT, f)).size, 0);
console.log(`  ${faces.length} 個區塊，合計 ${(total / 1024 / 1024).toFixed(1)} MB`);
console.log(`  第 0 塊（拉丁＋標點，一定會載入）：${(statSync(join(OUT, "huninn-0.woff2")).size / 1024).toFixed(0)} KB`);
