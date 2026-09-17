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
    label: "Budget",
    sub: "Keep it cheap",
    question: "Which one’s cheapest?",
    duck: "thinking",
    points: 2,
  },
  {
    key: "health",
    icon: "🥗",
    label: "Health",
    sub: "Something lighter",
    question: "Which feels healthiest tonight?",
    duck: "thinking",
    points: 2,
  },
  {
    key: "convenience",
    icon: "🚶",
    label: "Convenience",
    sub: "Easy, please",
    question: "Which one’s easiest to get?",
    duck: "neutral",
    points: 2,
  },
  {
    key: "craving",
    icon: "❤️",
    label: "Craving",
    sub: "I want what I want",
    question: "Be honest... which one are you craving most?",
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
          `${p.icon} ${p.key === "budget" ? "It’s the cheapest" : p.key === "health" ? "It feels healthiest" : p.key === "convenience" ? "It’s easy to get" : "You’re craving it most"}`,
        );
    if (secret === winner) r.unshift("❤️ You secretly wanted it");
    if (r.length < 2) r.push("🎲 The duck broke the tie");
    return r.slice(0, 3);
  }, [winner, wins, secret]);
  if (screen === "setup")
    return (
      <section className={s.flow}>
        <div className={s.progress}>
          <i style={{ width: `${progress}%` }} />
        </div>
        <DuckBuddy state="curious" />
        <h1>What are we choosing between?</h1>
        <p className={s.sub}>Give me 2–5 options.</p>
        <div className={s.inputs}>
          {options.map((o, i) => (
            <div className={s.inputRow} key={i}>
              <input
                aria-label={`Food option ${i + 1}`}
                placeholder={["Subway", "Ramen", "滷味"][i] || "Another option"}
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
            + Add another
          </button>
        )}
        <button
          className={s.primary}
          disabled={clean.length < 2}
          onClick={() => setScreen("priorities")}
        >
          Help me pick →
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
        <h1>What matters tonight?</h1>
        <p className={s.sub}>Pick up to two.</p>
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
          Next →
        </button>
        <button className={s.minor} onClick={() => decide({}, "")}>
          Honestly, I don’t care
        </button>
        <button className={s.back} onClick={() => setScreen("setup")}>
          ← Back
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
        <p className={s.sub}>One tap. Don’t overthink it.</p>
        <div className={s.choices}>
          {clean.map((o, i) => (
            <button className={s.choice} key={i} onClick={() => choose(o)}>
              <span>{emoji(o)}</span>
              {o}
            </button>
          ))}
          <button className={s.minor} onClick={() => choose()}>
            About the same
          </button>
          <button className={s.minor} onClick={() => choose()}>
            Not sure
          </button>
        </div>
        <button
          className={s.back}
          onClick={() => (ci ? setCi(ci - 1) : setScreen("priorities"))}
        >
          ← Back
        </button>
      </section>
    );
  if (screen === "gut")
    return (
      <section className={s.flow}>
        <DuckBuddy state="i-knew-it" />
        <h1>Okay, gut check.</h1>
        <p className={s.sub}>Is there one you secretly want?</p>
        <div className={s.choices}>
          <button className={s.choice} onClick={() => setScreen("gutpick")}>
            ❤️ Yes
          </button>
          <button className={s.choice} onClick={() => decide(scores, "")}>
            🤷 Nope
          </button>
          <button className={s.choice} onClick={() => decide(scores, "")}>
            🎲 I genuinely don’t care
          </button>
        </div>
      </section>
    );
  if (screen === "gutpick")
    return (
      <section className={s.flow}>
        <DuckBuddy state="curious" />
        <h1>Which one?</h1>
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
        <p className={s.thinking}>Hmm...</p>
      </section>
    );
  if (screen === "reject")
    return (
      <section className={s.flow}>
        <div className={s.result}>
          <DuckBuddy state="suspicious" />
          <h1>Oh? 👀</h1>
          <p className={s.message}>
            That’s useful information. Maybe you already know what you want.
          </p>
          <div className={s.rejectOptions}>
            <h2>Okay then, what sounds better?</h2>
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
          {emoji(winner)} {winner}.
        </h1>
        <p className={s.message}>Yeah. That’s the one tonight.</p>
        <ul className={s.reasons}>
          {reasons.map((r) => (
            <li key={r}>✓ {r}</li>
          ))}
        </ul>
        <details className={s.details}>
          <summary>Why this one?</summary>
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
              <span>Gut check</span>
              <b>+{secret === winner ? 3 : 0}</b>
            </div>
          )}
        </details>
        <div className={s.actions}>
          <button
            className={s.primary}
            onClick={() => {
              save("🍜", "Dinner", winner, "food");
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
            Sounds good ✓
          </button>
          <button className={s.textAction} onClick={() => setScreen("reject")}>
            ...I don’t want that
          </button>
        </div>
      </div>
    </section>
  );
}
