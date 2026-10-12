import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

// DuckBuddy renders `s[state]` straight from the CSS module. A state with no matching
// class produces no class at all — TypeScript is satisfied, nothing throws, and the duck
// just stops pulling that face. Only noticing it means looking at the right screen at
// the right moment, so it is checked here instead.
//
// neutral is deliberately exempt: it is the plain duck, and the component filters the
// empty value out rather than writing "undefined" into the DOM.

const ROOT = join(import.meta.dirname, "..");
const BASE_STATE = "neutral";

const duckStates = (): string[] => {
  const src = readFileSync(join(ROOT, "lib/buy-questions.ts"), "utf8");
  const block = /export type DuckState =([\s\S]*?);/.exec(src);
  assert.ok(block, "lib/buy-questions.ts 裡找不到 DuckState 的定義");
  return [...block[1].matchAll(/"([a-z-]+)"/g)].map((m) => m[1]);
};

const duckCss = () => readFileSync(join(ROOT, "components/BuyFlow.module.css"), "utf8");

test("每個鴨子表情都有對應的 CSS", () => {
  const css = duckCss();
  const missing = duckStates()
    .filter((s) => s !== BASE_STATE)
    .filter((s) => !new RegExp(`\\.${s}[\\s,{:]`).test(css));
  assert.deepEqual(missing, [], "這些表情沒有樣式，鴨子會毫無反應");
});

test("沒有多餘的表情樣式", () => {
  // 反方向：改了 DuckState 的拼字卻沒改 CSS，舊樣式會留在檔案裡永遠套不上。
  // 判斷依據是選擇器結構而不是名字長相——「.某個東西 .eye」裡的前者一定是表情，
  // 因為表情是加在 .duck 上、再往下選到部位的。thinking 和 neutral 不走這個形狀
  // （前者只改外框和 :after，後者沒有樣式），所以這張網只蓋得到其餘九個。
  const states = new Set(duckStates());
  const orphans = [
    ...duckCss().matchAll(/\.([a-z][a-z-]*)\s+\.(?:eye|beak|wing)\b/g),
  ]
    .map((m) => m[1])
    .filter((c, i, all) => all.indexOf(c) === i)
    .filter((c) => !states.has(c));
  assert.deepEqual(orphans, [], "這些樣式對不到任何 DuckState");
});

test("程式碼裡用到的表情都在型別裡", () => {
  // TypeScript 會擋下字面量，但從資料表來的值（questions 的 duck 欄位）走的是
  // 同一個型別，所以這裡順便確認資料表沒有偷渡沒定義的值
  const states = new Set(duckStates());
  const used = new Set<string>();
  for (const f of ["lib/buy-questions.ts", ...readdirSync(join(ROOT, "components")).filter((f) => f.endsWith(".tsx")).map((f) => join("components", f))]) {
    const src = readFileSync(join(ROOT, f), "utf8");
    for (const m of src.matchAll(/duck:\s*"([a-z-]+)"/g)) used.add(m[1]);
    for (const m of src.matchAll(/state="([a-z-]+)"/g)) used.add(m[1]);
  }
  const unknown = [...used].filter((u) => !states.has(u));
  assert.deepEqual(unknown, [], "這些值不是合法的 DuckState");
  assert.ok(used.size > 5, `只找到 ${used.size} 個使用處，擷取規則大概壞了`);
});

test("DuckBuddy 不會把 undefined 寫進 class", () => {
  const src = readFileSync(join(ROOT, "components/BuyFlow.tsx"), "utf8");
  assert.doesNotMatch(
    src,
    /className=\{`\$\{s\.duck\}\s\$\{s\[state\]\}`\}/,
    "樣板字串會讓沒有樣式的表情在 DOM 裡留下 undefined",
  );
});
