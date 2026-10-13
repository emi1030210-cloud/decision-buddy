// 歷史紀錄的儲存層。放在 lib 不只是分層：元件會 import CSS Module，node:test
// 解析不了，所以留在 DecisionBuddy.tsx 裡的這些防護就測不到。lib/buy-questions.ts
// 當初也是為了同一個理由搬出來的。
//
// localStorage 回來的東西沒有一樣是可信的。下面每個 try 都真的會丟：Safari 無痕
// 模式的 getItem、寫到一半的 JSON、配額滿了的 setItem、非安全情境下的 randomUUID。
// 任何一個沒接住就是整個 app 變成空白錯誤頁。
export const MODES = [
  "home",
  "food",
  "buy",
  "tasks",
  "compare",
  "random",
  "history",
] as const;
export type Mode = (typeof MODES)[number];
export const isMode = (v: unknown): v is Mode => MODES.includes(v as Mode);
export type Entry = {
  id: string;
  type: string;
  title: string;
  result: string;
  date: string;
  mode: Mode;
};
export const KEY = "buddy-history";
// Every one of these throws for real: getItem in Safari private mode, JSON.parse on a
// partial write, setItem on a full quota, randomUUID outside a secure context. Any of
// them reaching React unhandled takes the whole app down to a blank error page.
// Parsing successfully says nothing about the shape. An entry whose title is an object
// rather than a string reaches React as a child it cannot render and takes the app down
// to the same blank error page — so the fields that get rendered are checked, and
// anything that would not render is dropped. mode is deliberately not checked here:
// go() already sends an unrecognised one home, and an otherwise readable entry is
// still worth showing.
const RENDERED_FIELDS = ["id", "type", "title", "result", "date"] as const;
const isEntry = (v: unknown): v is Entry =>
  typeof v === "object" &&
  v !== null &&
  RENDERED_FIELDS.every(
    (k) => typeof (v as Record<string, unknown>)[k] === "string",
  );
export const readHistory = (): Entry[] => {
  try {
    const raw = localStorage.getItem(KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.filter(isEntry) : [];
  } catch {
    return [];
  }
};
export const writeHistory = (items: Entry[]) => {
  try {
    localStorage.setItem(KEY, JSON.stringify(items));
  } catch {}
};
export const newId = () => {
  try {
    return crypto.randomUUID();
  } catch {
    return Date.now().toString(36) + Math.random().toString(36).slice(2);
  }
};
