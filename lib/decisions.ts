// Pure scoring for all four guided modes. Deterministic throughout: where a
// flow needs a coin flip it asks for the tied set and flips it itself.

// --- 🔥 What Should I Do First? ---
export type Task = {
  name: string;
  deadline: number;
  duration: number;
  importance: number;
  energy: number;
};
export function rankTasks(tasks: Task[], available: number) {
  return [...tasks]
    .map((t) => ({
      ...t,
      score:
        (6 - Math.min(t.deadline, 5)) * 3 +
        t.importance * 3 +
        (t.duration <= available ? 3 : -2) +
        (6 - t.energy),
    }))
    .sort((a, b) => b.score - a.score);
}

// --- ⚖️ Help Me Choose ---
export type Criterion = { name: string; weight: number; ratings: number[] };
export function compare(options: string[], criteria: Criterion[]) {
  const max = criteria.reduce((s, c) => s + c.weight * 5, 0);
  return options
    .map((name, i) => ({
      name,
      score: Math.round(
        (criteria.reduce((s, c) => s + c.weight * (c.ratings[i] ?? 0), 0) /
          max) *
          100,
      ),
    }))
    .sort((a, b) => b.score - a.score);
}

// --- 🛍️ Should I Buy It? ---
// Every answer carries its own point value, positive or negative; the verdict
// is the running total. See the `questions` table in BuyFlow.tsx.
export type BuyVerdict = "BUY IT" | "WAIT 7 DAYS" | "DON’T BUY IT";
export function scoreBuy(values: number[]): {
  score: number;
  verdict: BuyVerdict;
} {
  const score = values.reduce((sum, v) => sum + v, 0);
  return {
    score,
    verdict:
      score >= 40 ? "BUY IT" : score >= 5 ? "WAIT 7 DAYS" : "DON’T BUY IT",
  };
}

// --- 🍜 What Should I Eat? ---
// Each priority question awards its points to the option that won it; the gut
// check adds three more. Returns whatever is tied at the top — narrowed to the
// craving pick, then the gut pick, if either is in the tie — for the caller to
// choose from.
export type FoodScores = Record<string, number>;
export function scoreFood(
  pool: string[],
  scores: FoodScores,
  { secret = "", craving = "" }: { secret?: string; craving?: string } = {},
): { scores: FoodScores; tied: string[] } {
  const final = { ...scores };
  if (secret) final[secret] = (final[secret] || 0) + 3;
  if (!pool.length) return { scores: final, tied: [] };
  const max = Math.max(...pool.map((x) => final[x] || 0));
  const tied = pool.filter((x) => (final[x] || 0) === max);
  if (craving && tied.includes(craving))
    return { scores: final, tied: [craving] };
  if (secret && tied.includes(secret)) return { scores: final, tied: [secret] };
  return { scores: final, tied };
}
