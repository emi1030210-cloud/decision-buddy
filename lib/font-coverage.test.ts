import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
// 跟 build-font.mjs 共用同一份「哪些字會被畫出來」的判定。
// 兩邊各算各的，就是當初這裡漏掉正規表達式的原因。
// @ts-expect-error -- .mjs 沒有型別宣告，這裡只需要執行期的值
import { uiCharacters as allUiCharacters } from "../scripts/ui-text.mjs";

// The Chinese face ships as unicode-range chunks (scripts/build-font.mjs). Chunk 0 is
// built from the app's own copy plus everyday Chinese and is the only one a normal page
// should need; the rest download on demand when someone types something unusual.
//
// Neither half of that fails loudly. Add copy with a character outside chunk 0 and the
// page silently fetches a second chunk on every load. Add one outside the font entirely
// and it renders in the system face next to rounded text, which is the exact mismatch
// the chunking was introduced to fix. So both are checked here rather than noticed later.

const ROOT = join(import.meta.dirname, "..");
const uiCharacters = (): Set<string> => allUiCharacters(ROOT);

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
  // 檔名帶內容雜湊，所以從 CSS 的第一條 @font-face 去拿，不要寫死。
  const first = chunkRanges()[0].file;
  const { size } = statSync(join(ROOT, "public/fonts", first));
  assert.ok(size < 450 * 1024, `${first} 有 ${Math.round(size / 1024)} KB，太大了`);
});

test("preload 指向的就是 CSS 裡的第 0 塊", () => {
  // app/layout.tsx 的 preload 從 huninn-chunk0.ts 拿檔名，那個檔案跟 CSS 都由
  // build-font.mjs 產生。萬一只重跑了一半，preload 會去抓一個已經不存在的雜湊，
  // 瀏覽器安靜地丟掉它——字體照樣會載，只是晚一個來回，沒有任何錯誤。
  const mod = readFileSync(join(ROOT, "app/huninn-chunk0.ts"), "utf8");
  const declared = /CHUNK_0 = "([^"]+)"/.exec(mod);
  assert.ok(declared, "huninn-chunk0.ts 裡找不到 CHUNK_0");
  assert.equal(
    declared[1],
    "/fonts/" + chunkRanges()[0].file,
    "preload 的檔名跟 CSS 第一條 @font-face 對不起來",
  );
  assert.ok(
    readFileSync(join(ROOT, "app/layout.tsx"), "utf8").includes("CHUNK_0"),
    "layout.tsx 沒有用到產生出來的檔名，大概又寫死了",
  );
});

test("每個區塊檔名都帶內容雜湊", () => {
  // next.config.mjs 叫瀏覽器把這些檔案留一年。沒有雜湊的話，換了字體的人
  // 會被舊檔案黏住一年——快取規則的正確性整個建立在檔名上。
  const wrong = chunkRanges()
    .map((c) => c.file)
    .filter((f) => !/^huninn-\d+\.[a-f0-9]{8}\.woff2$/.test(f));
  assert.deepEqual(wrong, [], "這些檔名沒有雜湊，不該被 immutable 快取");
});
