import test from "node:test";
import assert from "node:assert/strict";
import { questions, reasonCopy } from "./buy-questions.ts";
import type { Key } from "./buy-questions.ts";

const keys = Object.keys(questions) as Key[];

// The reason list on the verdict screen is looked up as reasonCopy[key][choice.label].
// A miss returns undefined and gets filtered out, so the list quietly shrinks and
// nothing anywhere reports a problem. Translating the labels once emptied it entirely.
test("每個答案都有對應的理由文案", () => {
  const orphans: string[] = [];
  for (const k of keys)
    for (const c of questions[k].choices)
      if (!reasonCopy[k]?.[c.label]) orphans.push(`${k}.${c.label}`);
  assert.deepEqual(orphans, [], "這些答案在 reasonCopy 裡查不到");
});

test("沒有多餘的理由文案", () => {
  const stale: string[] = [];
  for (const k of keys) {
    const labels = new Set(questions[k].choices.map((c) => c.label));
    for (const label of Object.keys(reasonCopy[k] ?? {}))
      if (!labels.has(label)) stale.push(`${k}.${label}`);
  }
  assert.deepEqual(stale, [], "這些理由文案對應的答案已經不存在");
});

// BuyFlow skips the condition question when owns is answered "沒有", and pauses longer
// on the budget answer "根本不該買". Both are string comparisons against labels, so a
// reworded label breaks the flow silently.
test("程式碼依賴的兩個 label 確實存在", () => {
  const owns = questions.owns.choices.map((c) => c.label);
  assert.ok(
    owns.includes("沒有"),
    `owns 少了「沒有」，只有 ${owns.join("、")}`,
  );
  const budget = questions.budget.choices.map((c) => c.label);
  assert.ok(
    budget.includes("根本不該買"),
    `budget 少了「根本不該買」，只有 ${budget.join("、")}`,
  );
});

test("同一題裡的 label 不重複", () => {
  // reasonCopy 以 label 當鍵，同題重複就會互相覆蓋
  for (const k of keys) {
    const labels = questions[k].choices.map((c) => c.label);
    assert.equal(new Set(labels).size, labels.length, `${k} 有重複的 label`);
  }
});

test("每個答案都有分數、說明和鴨子表情", () => {
  for (const k of keys)
    for (const c of questions[k].choices) {
      assert.equal(typeof c.value, "number", `${k}.${c.label} 沒有分數`);
      assert.ok(c.sub?.length, `${k}.${c.label} 沒有說明`);
      assert.ok(c.reaction?.length, `${k}.${c.label} 沒有鴨子的回應`);
      assert.ok(c.duck?.length, `${k}.${c.label} 沒有鴨子表情`);
    }
});

test("理由文案都是 emoji + 短句 + 說明三件組", () => {
  for (const k of keys)
    for (const [label, copy] of Object.entries(reasonCopy[k] ?? {})) {
      assert.equal(copy.length, 3, `${k}.${label} 不是三個元素`);
      for (const part of copy) assert.ok(part.length, `${k}.${label} 有空字串`);
    }
});

// The verdict thresholds are 40 and 5. If every answer were negative the flow could
// never reach 買吧, and if every answer were positive it could never reach 還是別買 —
// either would make a whole branch of the app unreachable.
test("分數範圍涵蓋得到三種判定", () => {
  const best = keys.reduce(
    (n, k) => n + Math.max(...questions[k].choices.map((c) => c.value)),
    0,
  );
  const worst = keys.reduce(
    (n, k) => n + Math.min(...questions[k].choices.map((c) => c.value)),
    0,
  );
  assert.ok(best >= 40, `最高分只有 ${best}，永遠到不了「買吧」`);
  assert.ok(worst < 5, `最低分有 ${worst}，永遠到不了「還是別買」`);
});

test("每題至少兩個選項", () => {
  for (const k of keys)
    assert.ok(questions[k].choices.length >= 2, `${k} 的選項不足`);
});

test("題目文字會帶入價格", () => {
  // budget 那題是唯一會用到價格的，其他題忽略參數
  assert.match(questions.budget.title("1200"), /1,200/);
  assert.ok(questions.owns.title("1200").length > 0);
});
