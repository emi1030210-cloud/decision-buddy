import test from "node:test";
import assert from "node:assert/strict";
import { KEY, MODES, isMode, newId, readHistory, writeHistory } from "./history.ts";
import type { Entry } from "./history.ts";

// These guards all exist because of the same failure: something unreadable comes back
// from localStorage and reaches React, which takes the whole app down to a blank
// "client-side exception" page rather than showing a broken row. Nothing here is
// hypothetical — every case below crashed the app when tried in a browser.

const entry = (p: Partial<Entry> = {}): Entry => ({
  id: "a",
  type: "🍜",
  title: "正常的一筆",
  result: "拉麵",
  date: "10月1日",
  mode: "food",
  ...p,
});

// node:test 沒有瀏覽器環境，自己接一個夠用的 localStorage
const fakeStorage = (impl: Partial<Storage> = {}) => {
  let store = "";
  globalThis.localStorage = {
    getItem: () => store,
    setItem: (_k: string, v: string) => {
      store = v;
    },
    ...impl,
  } as Storage;
  return {
    set: (raw: string) => {
      store = raw;
    },
    get: () => store,
  };
};

test("讀得回自己寫出去的", () => {
  fakeStorage();
  const items = [entry(), entry({ id: "b", mode: "buy" })];
  writeHistory(items);
  assert.deepEqual(readHistory(), items);
});

test("壞掉的 JSON 當成空的，而不是往外丟例外", () => {
  const s = fakeStorage();
  s.set("{這不是 json");
  assert.deepEqual(readHistory(), []);
});

test("不是陣列的值也當成空的", () => {
  const s = fakeStorage();
  for (const raw of ['"字串"', "42", "null", "{}"]) {
    s.set(raw);
    assert.deepEqual(readHistory(), [], `${raw} 應該讀成空陣列`);
  }
});

test("render 不出來的那幾筆會被丟掉", () => {
  const s = fakeStorage();
  // 這些都是合法 JSON，parse 不會丟——但 title 是物件、或整筆是 null 的時候，
  // React 會以 "Objects are not valid as a React child" 整個掛掉
  s.set(
    JSON.stringify([
      entry(),
      null,
      5,
      "字串",
      {},
      entry({ id: "c", title: { oops: 1 } as unknown as string }),
      entry({ id: "d", date: null as unknown as string }),
    ]),
  );
  const got = readHistory();
  assert.deepEqual(
    got.map((x) => x.id),
    ["a"],
    "只有真的能 render 的那筆該留下",
  );
});

test("多帶了不認識的欄位還是留著", () => {
  const s = fakeStorage();
  // 未來版本多存一個欄位，不該讓舊版把整筆丟掉
  s.set(JSON.stringify([{ ...entry(), extra: { x: 1 } }]));
  assert.equal(readHistory().length, 1);
});

test("mode 認不得或根本沒有的那筆都不會被丟掉", () => {
  const s = fakeStorage();
  // 畫面那邊由 isMode 擋，讀取這層不該連帶把整筆資料吃掉。
  // 改過名的模式、還有舊版根本沒存 mode 的那種，兩種都要留著。
  const missing = { ...entry({ id: "b" }) } as Partial<Entry>;
  delete missing.mode;
  s.set(JSON.stringify([entry({ mode: "quickpick" as Entry["mode"] }), missing]));
  assert.deepEqual(
    readHistory().map((x) => x.id),
    ["a", "b"],
  );
});

test("getItem 會丟例外時不會把 app 拖垮", () => {
  // Safari 無痕模式真的會丟
  fakeStorage({
    getItem: () => {
      throw new DOMException("denied");
    },
  });
  assert.deepEqual(readHistory(), []);
});

test("setItem 會丟例外時不會把 app 拖垮", () => {
  // 配額滿了
  fakeStorage({
    setItem: () => {
      throw new DOMException("quota");
    },
  });
  assert.doesNotThrow(() => writeHistory([entry()]));
});

test("isMode 只認得真的模式", () => {
  for (const m of MODES) assert.ok(isMode(m), `${m} 應該是合法模式`);
  for (const v of ["quickpick", "", null, undefined, 5, {}])
    assert.equal(isMode(v), false, `${JSON.stringify(v)} 不該是合法模式`);
});

test("MODES 和畫面表一一對應", () => {
  // Record<Mode, …> 已經在編譯期擋住缺漏，這裡擋的是另一邊：
  // MODES 少掉一個、但 screens 還留著，型別不會抱怨
  assert.equal(new Set(MODES).size, MODES.length, "MODES 有重複");
  assert.ok(MODES.includes("home"), "fallback 用的 home 必須存在");
});

test("newId 在沒有 crypto.randomUUID 時仍然給得出 id", () => {
  const real = globalThis.crypto;
  try {
    // 非安全情境（http 開的頁面）就沒有 randomUUID
    Object.defineProperty(globalThis, "crypto", {
      value: {},
      configurable: true,
    });
    const ids = new Set(Array.from({ length: 50 }, newId));
    assert.equal(ids.size, 50, "退回去的那條路不該產生重複的 id");
    for (const id of ids) assert.ok(id.length > 0);
  } finally {
    Object.defineProperty(globalThis, "crypto", {
      value: real,
      configurable: true,
    });
  }
});

test("KEY 沒有被改掉", () => {
  // 改了這個字串，所有人已經存的紀錄就全部讀不到了
  assert.equal(KEY, "buddy-history");
});
