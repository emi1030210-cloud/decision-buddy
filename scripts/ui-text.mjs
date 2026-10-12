// Which characters the app actually puts on screen.
//
// Two things need this answer and must agree: build-font.mjs, which decides what goes
// into font chunk 0, and lib/font-coverage.test.ts, which checks nothing rendered falls
// outside it. They were computing it separately and had already drifted — the test
// stripped regex literals, the build script did not.
//
// Source text is not the same as rendered text. A comment written in Chinese is never
// shown to anyone, and a Chinese character inside a regex is matched against what
// someone types, not displayed. Counting either pads chunk 0 with characters no page
// ever paints, and makes writing a Chinese comment fail the font test.
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

export const sourceFiles = (root = ".") =>
  ["components", "app", "lib"].flatMap((dir) =>
    readdirSync(join(root, dir))
      .filter((f) => /\.tsx?$/.test(f) && !f.endsWith(".test.ts"))
      .map((f) => join(dir, f)),
  );

export function renderedText(src) {
  return (
    src
      // 區塊註解
      .replace(/\/\*[\s\S]*?\*\//g, " ")
      // 行註解。前面是冒號就放過，那是 http:// 這種網址。
      .replace(/(^|[^:])\/\/[^\n]*/gm, "$1")
      // 正規表達式字面量，但只認「後面緊接著 .test(」這一種。辨識任意的
      // 正規表達式會把 a / b / c 這種除法誤判成字面量，默默吃掉中間真正的
      // 文案——寧可漏掉也不要誤刪。目前帶中文的字面量都在 emoji() 裡，
      // 全部是這個形狀。
      .replace(/\/[^/\n]+\/[gimsuy]*\.test\(/g, "(")
  );
}

// 漢字、全形標點——會被畫到畫面上的那些
export function uiCharacters(root = ".") {
  const out = new Set();
  for (const f of sourceFiles(root)) {
    const text = renderedText(readFileSync(join(root, f), "utf8"));
    for (const ch of text) if (ch >= "　" && ch <= "鿿") out.add(ch);
  }
  return out;
}
