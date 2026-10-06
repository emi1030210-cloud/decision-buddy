"use client";
import { useEffect, useMemo, useState } from "react";
import s from "./BuyFlow.module.css";
import { scoreBuy } from "@/lib/decisions";
import { questions, reasonCopy } from "@/lib/buy-questions";
import type { Choice, DuckState, Key } from "@/lib/buy-questions";

export type { DuckState };

export function DuckBuddy({ state = "neutral" }: { state?: DuckState }) {
  return (
    <div className={`${s.duck} ${s[state]}`} aria-label={`鴨子夥伴：${state}`}>
      <i className={s.wing} />
      <i className={s.wing} />
      <b className={s.eye} />
      <b className={s.eye} />
      <span className={s.beak} />
      {state === "curious" && <em className={s.prop}>?</em>}
    </div>
  );
}
export default function BuyFlow({
  save,
}: {
  save: (type: string, title: string, result: string, mode: "buy") => void;
}) {
  const [item, setItem] = useState("");
  const [price, setPrice] = useState("");
  const [screen, setScreen] = useState<
    "setup" | "questions" | "thinking" | "verdict"
  >("setup");
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Partial<Record<Key, Choice>>>({});
  const [selected, setSelected] = useState<number | null>(null);
  const [reaction, setReaction] = useState("");
  const [duck, setDuck] = useState<DuckState>("curious");
  const [thinkLine, setThinkLine] = useState("Hmm...");
  const [rejected, setRejected] = useState(false);
  const steps = useMemo<Key[]>(
    () =>
      answers.owns?.label === "沒有"
        ? ["owns", "wanted", "usage", "budget", "reason"]
        : ["owns", "condition", "wanted", "usage", "budget", "reason"],
    [answers.owns],
  );
  const key = steps[index];
  const total = steps.length;
  const { score, verdict } = scoreBuy(
    Object.values(answers).map((c) => c?.value || 0),
  );
  const rankedReasons = Object.entries(answers)
    .map(([k, c]) => ({ key: k, choice: c!, copy: reasonCopy[k]?.[c!.label] }))
    .filter((r) => r.copy)
    .sort((a, b) => Math.abs(b.choice.value) - Math.abs(a.choice.value));
  useEffect(() => {
    if (screen !== "thinking") return;
    setThinkLine("嗯…");
    const t1 = setTimeout(() => setScreen("verdict"), 900);
    return () => {
      clearTimeout(t1);
    };
  }, [screen]);
  const choose = (c: Choice, i: number) => {
    setSelected(i);
    setReaction(c.reaction);
    setDuck(c.duck);
    setAnswers((a) => ({ ...a, [key]: c }));
    setTimeout(
      () => {
        if (index >= steps.length - 1) setScreen("thinking");
        else setIndex(index + 1);
        setSelected(null);
        setReaction("");
        setDuck("thinking");
      },
      c.label === "根本不該買" ? 700 : 480,
    );
  };
  const back = () => {
    if (index === 0) setScreen("setup");
    else {
      setIndex(index - 1);
      setReaction("");
      setSelected(null);
    }
  };
  if (screen === "setup")
    return (
      <section className={s.flow}>
        <DuckBuddy state="curious" />
        <h1 className={s.question}>好，我們在考慮買什麼？</h1>
        <p className={s.helper}>先不批評你。目前啦。</p>
        <div className={s.setup}>
          <label className={s.field}>
            品名
            <input
              placeholder="跑鞋"
              value={item}
              onChange={(e) => setItem(e.target.value)}
            />
          </label>
          <label className={s.field}>
            價格（NT$）
            <input
              type="number"
              inputMode="decimal"
              placeholder="2,680"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
            />
          </label>
          <button
            className={s.cta}
            disabled={!item || !price}
            onClick={() => setScreen("questions")}
          >
            來聊聊這個 →
          </button>
        </div>
      </section>
    );
  if (screen === "thinking")
    return (
      <section className={s.flow}>
        <DuckBuddy state="thinking" />
        <p className={s.thinkingCopy}>{thinkLine}</p>
      </section>
    );
  if (screen === "verdict") {
    const copy =
      verdict === "買吧"
        ? ["買吧。", "嗯，這個說得通。", "happy"]
        : verdict === "再等七天"
          ? ["先等一下。", "你想要，但也許不是今天。", "thinking"]
          : ["還是別買。", "我覺得這個不太值得。", "suspicious"];
    if (rejected)
      return (
        <section className={s.flow}>
          <div className={`${s.verdict} ${s.rejection}`}>
            <DuckBuddy state="i-knew-it" />
            <h1>喔？👀</h1>
            <p>看來你心裡早就有答案了。</p>
            <div className={s.verdictActions}>
              <button
                className={s.save}
                onClick={() => {
                  setRejected(false);
                  setScreen("questions");
                  setIndex(0);
                }}
              >
                我要改答案
              </button>
            </div>
          </div>
        </section>
      );
    return (
      <section className={s.flow}>
        <div className={s.verdict}>
          <div className={s.revealDuck}>
            <DuckBuddy state={copy[2] as DuckState} />
          </div>
          <h1 className={s.revealTitle}>{copy[0]}</h1>
          <p className={s.revealMessage}>{copy[1]}</p>
          <ul className={s.simpleReasons}>
            {rankedReasons.slice(0, 3).map(({ key, choice, copy: r }) => (
              <li key={key}>
                <span>{choice.value >= 0 ? "✓" : "−"}</span>
                {r[1]}
              </li>
            ))}
          </ul>
          <details className={s.details}>
            <summary>為什麼是這個結果？</summary>
            <h3>原因</h3>
            <ul>
              {rankedReasons.slice(0, 4).map(({ key, choice, copy: r }) => (
                <li key={key}>
                  {choice.value >= 0 ? "✓" : "−"} {r[1]}
                </li>
              ))}
            </ul>
            <p>
              <b>鴨子評分：{score}</b>
            </p>
          </details>
          <div className={s.verdictActions}>
            <button
              className={s.save}
              onClick={() => {
                save("🛍️", item, verdict, "buy");
                setScreen("setup");
                setIndex(0);
                setAnswers({});
                setItem("");
                setPrice("");
                setSelected(null);
                setReaction("");
                setDuck("curious");
                setRejected(false);
              }}
            >
              完成 ✓
            </button>
            <button className={s.textAction} onClick={() => setRejected(true)}>
              嗯…我不同意
            </button>
          </div>
        </div>
      </section>
    );
  }
  const q = questions[key];
  return (
    <section className={s.flow}>
      <div className={s.top}>
        <span>
          {index + 1} / {total}
        </span>
        <div className={s.track}>
          <i style={{ width: `${((index + 1) / total) * 100}%` }} />
        </div>
      </div>
      <DuckBuddy state={duck} />
      <h1 className={s.question}>{q.title(price)}</h1>
      <p className={s.helper}>{reaction || "誠實作答，鴨子看得出來。"}</p>
      <div className={`${s.answers} ${key === "reason" ? s.grid : ""}`}>
        {q.choices.map((c, i) => (
          <button
            key={c.label}
            className={`${s.answer} ${selected === i ? s.selected : ""}`}
            aria-pressed={selected === i}
            disabled={selected !== null}
            onClick={() => choose(c, i)}
          >
            {c.icon && <span className={s.answerIcon}>{c.icon}</span>}
            <span className={s.answerText}>
              <b>{c.label}</b>
              <small>{c.sub}</small>
            </span>
          </button>
        ))}
      </div>
      <button className={s.back} onClick={back}>
        ← Back
      </button>
    </section>
  );
}
