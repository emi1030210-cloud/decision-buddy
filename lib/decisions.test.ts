import test from "node:test";
import assert from "node:assert/strict";
import { compare, rankTasks, scoreBuy, scoreFood } from "./decisions.ts";
// Node 執行期會剝除型別，所以型別要用 import type 單獨匯入
import type { Task } from "./decisions.ts";

const task = (name: string, p: Partial<Task> = {}): Task => ({
  name,
  deadline: 3,
  duration: 1,
  importance: 3,
  energy: 3,
  ...p,
});

test("rankTasks 把最急的排前面", () => {
  const r = rankTasks([task("慢的", { deadline: 5 }), task("急的", { deadline: 1 })], 2);
  assert.equal(r[0].name, "急的");
});

test("rankTasks 的截止日影響力大於重要性", () => {
  // 這是設計上的取捨，不是 bug：截止日每級 3 分、重要性每級 3 分，
  // 但截止日的級距大得多。改了計分公式的話這個測試會提醒你。
  const r = rankTasks(
    [
      task("今天到期但不重要", { deadline: 1, importance: 1 }),
      task("很重要但還早", { deadline: 5, importance: 5 }),
    ],
    2,
  );
  assert.equal(r[0].name, "今天到期但不重要");
});

test("rankTasks 會加分給塞得進現有時間的事", () => {
  const fits = rankTasks([task("短的", { duration: 1 })], 2)[0].score;
  const doesnt = rankTasks([task("短的", { duration: 3 })], 2)[0].score;
  assert.equal(fits - doesnt, 5, "塞得進 +3、塞不進 -2，相差 5");
});

test("rankTasks 不會改動傳進來的陣列", () => {
  const input = [task("乙", { deadline: 5 }), task("甲", { deadline: 1 })];
  const copy = [...input];
  rankTasks(input, 2);
  assert.deepEqual(input, copy);
});

test("compare 用權重算分並正規化到 100", () => {
  // 單一評分項、權重 4、滿分 5 → 4*5 / (4*5) = 100
  const r = compare(["甲"], [{ name: "價格", weight: 4, ratings: [5] }]);
  assert.equal(r[0].score, 100);
});

test("compare 的完整算式", () => {
  // 滿分 = (5+3) * 5 = 40
  // 首爾 = 5*2 + 3*4 = 22 → 55
  // 東京 = 5*1 + 3*5 = 20 → 50
  // 河內 = 5*5 + 3*2 = 31 → 77.5 → 78
  const r = compare(
    ["首爾", "東京", "河內"],
    [
      { name: "價格", weight: 5, ratings: [2, 1, 5] },
      { name: "品質", weight: 3, ratings: [4, 5, 2] },
    ],
  );
  assert.deepEqual(r, [
    { name: "河內", score: 78 },
    { name: "首爾", score: 55 },
    { name: "東京", score: 50 },
  ]);
});

test("compare 由高分排到低分", () => {
  const r = compare(
    ["低", "高"],
    [{ name: "x", weight: 3, ratings: [1, 5] }],
  );
  assert.deepEqual(r.map((x) => x.name), ["高", "低"]);
});

test("scoreBuy 的三個判定門檻", () => {
  assert.equal(scoreBuy([40]).verdict, "買吧");
  assert.equal(scoreBuy([39]).verdict, "再等七天");
  assert.equal(scoreBuy([5]).verdict, "再等七天");
  assert.equal(scoreBuy([4]).verdict, "還是別買");
});

test("scoreBuy 把答案點數加總，負分也算", () => {
  // 這組是介面上「每題都選第一個選項」會得到的分數
  assert.equal(scoreBuy([20, -15, -20, 15, 20]).score, 20);
  assert.equal(scoreBuy([]).score, 0);
});

test("scoreFood 的直覺加分是 3 分", () => {
  const { scores } = scoreFood(["甲", "乙"], { 甲: 2 }, { secret: "甲" });
  assert.equal(scores.甲, 5);
});

test("scoreFood 平手時「最想吃」優先於直覺選的", () => {
  // 直覺加分是在平手判定「之前」就加上去的，所以要讓乙 加完 3 分後
  // 才跟甲 同分，這時候才輪到優先序決定
  const { scores, tied } = scoreFood(
    ["甲", "乙"],
    { 甲: 6, 乙: 3 },
    { craving: "甲", secret: "乙" },
  );
  assert.equal(scores.乙, 6, "乙 拿到直覺加分後與甲 同分");
  assert.deepEqual(tied, ["甲"], "同分時最想吃的勝出");
});

test("scoreFood 沒有最想吃時，直覺選的勝出", () => {
  const { tied } = scoreFood(["甲", "乙"], { 甲: 3 }, { secret: "乙" });
  assert.deepEqual(tied, ["乙"], "乙 拿到 +3 後與甲同分，由直覺勝出");
});

test("scoreFood 真的平手時把全部回傳，讓呼叫端擲骰", () => {
  const { tied } = scoreFood(["甲", "乙", "丙"], { 甲: 2, 乙: 2, 丙: 1 });
  assert.deepEqual(tied, ["甲", "乙"]);
});

test("scoreFood 空清單不會爆", () => {
  // Math.max(...[]) 會是 -Infinity，所以這裡要先擋掉
  assert.deepEqual(scoreFood([], {}), { scores: {}, tied: [] });
});

test("scoreFood 不會改動傳進來的分數表", () => {
  const input = { 甲: 1 };
  scoreFood(["甲"], input, { secret: "甲" });
  assert.deepEqual(input, { 甲: 1 });
});
