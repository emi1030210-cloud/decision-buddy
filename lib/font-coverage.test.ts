import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

// The Chinese face ships as unicode-range chunks (scripts/build-font.mjs). Chunk 0 is
// built from the app's own copy plus everyday Chinese and is the only one a normal page
// should need; the rest download on demand when someone types something unusual.
//
// Neither half of that fails loudly. Add copy with a character outside chunk 0 and the
// page silently fetches a second chunk on every load. Add one outside the font entirely
// and it renders in the system face next to rounded text, which is the exact mismatch
// the chunking was introduced to fix. So both are checked here rather than noticed later.

const ROOT = join(import.meta.dirname, "..");

function chunkRanges(): { file: string; has: (cp: number) => boolean }[] {
  const css = readFileSync(join(ROOT, "app/huninn.css"), "utf8");
  return [
    ...css.matchAll(/url\('\/fonts\/([^']+)'\)[^}]*unicode-range:([^;}]+)/g),
  ].map(([, file, spec]) => {
    const ranges = spec.split(",").map((r) => {
      const [a, b] = r.trim().replace(/^U\+/i, "").split("-");
      return [parseInt(a, 16), parseInt(b ?? a, 16)] as const;
    });
    return {
      file,
      has: (cp: number) => ranges.some(([a, b]) => cp >= a && cp <= b),
    };
  });
}

function uiCharacters(): Set<string> {
  const files = [
    ...readdirSync(join(ROOT, "components"))
      .filter((f) => f.endsWith(".tsx"))
      .map((f) => join("components", f)),
    "app/layout.tsx",
    "app/page.tsx",
    "lib/decisions.ts",
    "lib/buy-questions.ts",
  ];
  const out = new Set<string>();
  for (const f of files) {
    // Characters inside a regex are matched against user input, never shown — emoji()
    // tests for 卤味 and 鸡 so simplified spellings still get an icon. Counting them
    // would demand font coverage for text the app never renders.
    const src = readFileSync(join(ROOT, f), "utf8").replace(
      /\/[^/\n]+\/\.test\(/g,
      "(",
    );
    for (const ch of src) if (ch >= "　" && ch <= "鿿") out.add(ch);
  }
  return out;
}

test("介面用到的字都在第 0 塊裡", () => {
  const chunks = chunkRanges();
  const first = chunks[0];
  const missing = [...uiCharacters()].filter(
    (c) => !first.has(c.codePointAt(0)!),
  );
  assert.deepEqual(
    missing,
    [],
    `這些字不在 ${first.file}，每次載入都會多抓一個區塊。` +
      `改過文案的話重跑 node scripts/build-font.mjs`,
  );
});

test("介面用到的字都在字體裡", () => {
  const chunks = chunkRanges();
  const missing = [...uiCharacters()].filter(
    (c) => !chunks.some((k) => k.has(c.codePointAt(0)!)),
  );
  assert.deepEqual(missing, [], "這些字整個字體都沒有，會掉到系統字體");
});

test("CSS 宣告的區塊檔案都存在", () => {
  const onDisk = new Set(
    readdirSync(join(ROOT, "public/fonts")).filter((f) => f.endsWith(".woff2")),
  );
  const declared = chunkRanges().map((c) => c.file);
  assert.deepEqual(
    declared.filter((f) => !onDisk.has(f)),
    [],
    "CSS 指向不存在的字體檔",
  );
  assert.deepEqual(
    [...onDisk].filter((f) => !declared.includes(f)),
    [],
    "有字體檔沒被任何 @font-face 宣告，等於白佔空間",
  );
});

test("第 0 塊不該大到失去分塊的意義", () => {
  // 分塊的重點就是初次載入要小。超過這個數字就該檢討常用字表了。
  const { size } = statSync(join(ROOT, "public/fonts/huninn-0.woff2"));
  assert.ok(size < 450 * 1024, `第 0 塊 ${Math.round(size / 1024)} KB，太大了`);
});
