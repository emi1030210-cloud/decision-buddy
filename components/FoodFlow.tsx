"use client";
import { useMemo, useState } from "react";
import { DuckBuddy, DuckState } from "./BuyFlow";
import s from "./FoodFlow.module.css";
import { scoreFood } from "@/lib/decisions";
type Priority = "budget" | "health" | "convenience" | "craving";
const priorities: {
  key: Priority;
  icon: string;
  label: string;
  sub: string;
  question: string;
  duck: DuckState;
  points: number;
}[] = [
  {
    key: "budget",
    icon: "💰",
    label: "預算",
    sub: "便宜就好",
    question: "哪一個最便宜？",
    duck: "thinking",
    points: 2,
  },
  {
    key: "health",
    icon: "🥗",
    label: "健康",
    sub: "想吃清爽一點",
    question: "今天哪一個最健康？",
    duck: "thinking",
    points: 2,
  },
  {
    key: "convenience",
    icon: "🚶",
    label: "方便",
    sub: "拜託簡單一點",
    question: "哪一個最好拿到？",
    duck: "neutral",
    points: 2,
  },
  {
    key: "craving",
    icon: "❤️",
    label: "想吃",
    sub: "我就是想吃那個",
    question: "老實說…你現在最想吃哪一個？",
    duck: "curious",
    points: 3,
  },
];
const emoji = (name: string) => {
  const n = name.toLowerCase();
  if (/ramen|麵|面/.test(n)) return "🍜";
  if (/pizza/.test(n)) return "🍕";
  if (/burger|漢堡/.test(n)) return "🍔";
  if (/subway|sandwich|三明治/.test(n)) return "🥪";
  if (/salad|沙拉/.test(n)) return "🥗";
  if (/sushi|壽司|寿司/.test(n)) return "🍣";
  if (/hotpot|火鍋|滷味|卤味/.test(n)) return "🍲";
  if (/chicken|雞|鸡/.test(n)) return "🍗";
  if (/coffee|咖啡/.test(n)) return "☕";
  if (/cake|dessert|甜點|甜点/.test(n)) return "🍰";
  return "🍽️";
};
export default function FoodFlow({
  save,
}: {
  save: (type: string, title: string, result: string, mode: "food") => void;
}) {
  const [screen, setScreen] = useState<
    | "setup"
    | "priorities"
    | "compare"
    | "gut"
    | "gutpick"
    | "thinking"
    | "result"
    | "reject"
  >("setup");
  const [options, setOptions] = useState(["", "", ""]);
  const [picked, setPicked] = useState<Priority[]>([]);
  const [ci, setCi] = useState(0);
  const [scores, setScores] = useState<Record<string, number>>({});
  const [wins, setWins] = useState<Partial<Record<Priority, string>>>({});
  const [secret, setSecret] = useState("");
  const [winner, setWinner] = useState("");
  const clean = options.filter((x) => x.trim()).map((x) => x.trim());
  const current = priorities.find((p) => p.key === picked[ci]);
  const progress =
    screen === "setup"
      ? 12
      : screen === "priorities"
        ? 30
        : screen === "compare"
          ? 45 + (ci / Math.max(picked.length, 1)) * 25
          : screen === "gut" || screen === "gutpick"
            ? 78
            : 100;
  const decide = (next = scores, secretChoice = secret, without = "") => {
    const pool = clean.filter((x) => x !== without);
    const { scores: final, tied } = scoreFood(pool, next, {
      secret: secretChoice,
      craving: wins.craving,
    });
    setScores(final);
    setWinner(tied[Math.floor(Math.random() * tied.length)] || pool[0]);
    setScreen("thinking");
    setTimeout(() => setScreen("result"), 750);
  };
  const choose = (name = "") => {
    const next = { ...scores };
    if (name && current) {
      next[name] = (next[name] || 0) + current.points;
      setWins({ ...wins, [current.key]: name });
    }
    setScores(next);
    if (ci < picked.length - 1) setCi(ci + 1);
    else setScreen("gut");
  };
  const reasons = useMemo(() => {
    const r: string[] = [];
    for (const p of priorities)
      if (wins[p.key] === winner)
        r.push(
          `${p.icon} ${p.key === "budget" ? "它最便宜" : p.key === "health" ? "它最健康" : p.key === "convenience" ? "它最方便" : "你最想吃它"}`,
        );
    if (secret === winner) r.unshift("❤️ 你心裡本來就想要它");
    if (r.length < 2) r.push("🎲 鴨子幫你抽籤決定");
    return r.slice(0, 3);
  }, [winner, wins, secret]);
  if (screen === "setup")
    return (
      <section className={s.flow}>
        <div className={s.progress}>
          <i style={{ width: `${progress}%` }} />
        </div>
        <DuckBuddy state="curious" />
        <h1>在哪幾個之間猶豫？</h1>
        <p className={s.sub}>給我 2–5 個選項。</p>
        <div className={s.inputs}>
          {options.map((o, i) => (
            <div className={s.inputRow} key={i}>
              <input
                aria-label={`選項 ${i + 1}`}
                placeholder={["牛肉麵", "拉麵", "滷味"][i] || "再一個選項"}
                value={o}
                onChange={(e) =>
                  setOptions(
                    options.map((x, j) => (j === i ? e.target.value : x)),
                  )
                }
              />
              {options.length > 2 && (
                <button
                  className={s.remove}
                  onClick={() => setOptions(options.filter((_, j) => j !== i))}
                >
                  ×
                </button>
              )}
            </div>
          ))}
        </div>
        {options.length < 5 && (
          <button
            className={s.add}
            onClick={() => setOptions([...options, ""])}
          >
            ＋ 再加一個
          </button>
        )}
        <button
          className={s.primary}
          disabled={clean.length < 2}
          onClick={() => setScreen("priorities")}
        >
          幫我挑 →
        </button>
      </section>
    );
  if (screen === "priorities")
    return (
      <section className={s.flow}>
        <div className={s.progress}>
          <i style={{ width: `${progress}%` }} />
        </div>
        <DuckBuddy />
        <h1>今天在意什麼？</h1>
        <p className={s.sub}>最多挑兩個。</p>
        <div className={s.cards}>
          {priorities.map((p) => (
            <button
              key={p.key}
              className={`${s.card} ${picked.includes(p.key) ? s.selected : ""}`}
              onClick={() =>
                setPicked(
                  picked.includes(p.key)
                    ? picked.filter((x) => x !== p.key)
                    : picked.length < 2
                      ? [...picked, p.key]
                      : picked,
                )
              }
            >
              <b>
                {p.icon} {p.label}
              </b>
              <small>{p.sub}</small>
            </button>
          ))}
        </div>
        <button
          className={s.primary}
          disabled={!picked.length}
          onClick={() => setScreen("compare")}
        >
          下一步 →
        </button>
        <button className={s.minor} onClick={() => decide({}, "")}>
          老實說我沒差
        </button>
        <button className={s.back} onClick={() => setScreen("setup")}>
          ← 上一步
        </button>
      </section>
    );
  if (screen === "compare" && current)
    return (
      <section className={s.flow}>
        <div className={s.progress}>
          <i style={{ width: `${progress}%` }} />
        </div>
        <DuckBuddy state={current.duck} />
        <h1>{current.question}</h1>
        <p className={s.sub}>點一下就好，別想太多。</p>
        <div className={s.choices}>
          {clean.map((o, i) => (
            <button className={s.choice} key={i} onClick={() => choose(o)}>
              <span>{emoji(o)}</span>
              {o}
            </button>
          ))}
          <button className={s.minor} onClick={() => choose()}>
            差不多
          </button>
          <button className={s.minor} onClick={() => choose()}>
            不確定
          </button>
        </div>
        <button
          className={s.back}
          onClick={() => (ci ? setCi(ci - 1) : setScreen("priorities"))}
        >
          ← 上一步
        </button>
      </section>
    );
  if (screen === "gut")
    return (
      <section className={s.flow}>
        <DuckBuddy state="i-knew-it" />
        <h1>好，憑直覺。</h1>
        <p className={s.sub}>有沒有哪一個你偷偷想要？</p>
        <div className={s.choices}>
          <button className={s.choice} onClick={() => setScreen("gutpick")}>
            ❤️ 有
          </button>
          <button className={s.choice} onClick={() => decide(scores, "")}>
            🤷 沒有
          </button>
          <button className={s.choice} onClick={() => decide(scores, "")}>
            🎲 我是真的沒差
          </button>
        </div>
      </section>
    );
  if (screen === "gutpick")
    return (
      <section className={s.flow}>
        <DuckBuddy state="curious" />
        <h1>哪一個？</h1>
        <div className={s.choices}>
          {clean.map((o, i) => (
            <button
              className={s.choice}
              key={i}
              onClick={() => {
                setSecret(o);
                decide(scores, o);
              }}
            >
              <span>{emoji(o)}</span>
              {o}
            </button>
          ))}
        </div>
      </section>
    );
  if (screen === "thinking")
    return (
      <section className={s.flow}>
        <DuckBuddy state="thinking" />
        <p className={s.thinking}>嗯…</p>
      </section>
    );
  if (screen === "reject")
    return (
      <section className={s.flow}>
        <div className={s.result}>
          <DuckBuddy state="suspicious" />
          <h1>喔？👀</h1>
          <p className={s.message}>
            That’s useful information. Maybe you already know what you want.
          </p>
          <div className={s.rejectOptions}>
            <h2>那你比較想要哪一個？</h2>
            <div className={s.choices}>
              {clean
                .filter((o) => o !== winner)
                .map((o, i) => (
                  <button
                    className={s.choice}
                    key={i}
                    onClick={() => {
                      setWinner(o);
                      setScreen("result");
                    }}
                  >
                    <span>{emoji(o)}</span>
                    {o}
                  </button>
                ))}
            </div>
            <button
              className={s.textAction}
              onClick={() => decide(scores, "", winner)}
            >
              Pick again without this one
            </button>
          </div>
        </div>
      </section>
    );
  return (
    <section className={s.flow}>
      <div className={s.result}>
        <DuckBuddy state="happy" />
        <h1>
          {emoji(winner)} {winner}
        </h1>
        <p className={s.message}>嗯，今天就這個。</p>
        <ul className={s.reasons}>
          {reasons.map((r) => (
            <li key={r}>✓ {r}</li>
          ))}
        </ul>
        <details className={s.details}>
          <summary>為什麼是它？</summary>
          {picked.map((k) => (
            <div key={k}>
              <span>{priorities.find((p) => p.key === k)?.label}</span>
              <b>
                +
                {wins[k] === winner
                  ? priorities.find((p) => p.key === k)?.points
                  : 0}
              </b>
            </div>
          ))}
          {secret && (
            <div>
              <span>直覺加分</span>
              <b>+{secret === winner ? 3 : 0}</b>
            </div>
          )}
        </details>
        <div className={s.actions}>
          <button
            className={s.primary}
            onClick={() => {
              save("🍜", "今天吃什麼", winner, "food");
              setScreen("setup");
              setScores({});
              setWins({});
              setPicked([]);
              setOptions(["", "", ""]);
              setCi(0);
              setSecret("");
              setWinner("");
            }}
          >
            好，就這個 ✓
          </button>
          <button className={s.textAction} onClick={() => setScreen("reject")}>
            …我不想要那個
          </button>
        </div>
      </div>
    </section>
  );
}
