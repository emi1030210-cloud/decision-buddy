"use client";
import { useEffect, useState } from "react";
import { DuckBuddy } from "./BuyFlow";
import s from "./Flow.module.css";
import { compare, Criterion } from "@/lib/decisions";

const presets: { icon: string; name: string; sub: string }[] = [
  { icon: "💰", name: "價格", sub: "要花我多少錢" },
  { icon: "😊", name: "開心度", sub: "我會有多喜歡" },
  { icon: "⭐", name: "品質", sub: "實際上好不好" },
  { icon: "⏱️", name: "時間", sub: "要花多久" },
  { icon: "💪", name: "費力程度", sub: "要出多少力" },
  { icon: "📈", name: "長遠來看", sub: "一年後回頭怎麼想" },
];
const scale = [1, 2, 3, 4, 5];
const placeholders = ["首爾", "東京", "河內"];

function Pills({
  label,
  hints,
  value,
  onChange,
}: {
  label: string;
  hints: [string, string];
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className={s.row} role="group" aria-label={label}>
      <span>{label}</span>
      <div className={s.pills}>
        {scale.map((n) => (
          <button
            key={n}
            className={`${s.pill} ${value === n ? s.on : ""}`}
            aria-label={`${label}: ${n} of 5`}
            aria-pressed={value === n}
            onClick={() => onChange(n)}
          >
            {n}
            {n === 1 && <small>{hints[0]}</small>}
            {n === 5 && <small>{hints[1]}</small>}
          </button>
        ))}
      </div>
    </div>
  );
}

export default function CompareFlow({
  save,
}: {
  save: (type: string, title: string, result: string, mode: "compare") => void;
}) {
  const [screen, setScreen] = useState<
    "setup" | "criteria" | "rate" | "thinking" | "result"
  >("setup");
  const [options, setOptions] = useState(["", ""]);
  const [criteria, setCriteria] = useState<Criterion[]>([]);
  const [ci, setCi] = useState(0);
  const clean = options.filter((x) => x.trim()).map((x) => x.trim());
  const results = compare(clean, criteria);
  const winner = results[0];
  const reset = () => {
    setScreen("setup");
    setOptions(["", ""]);
    setCriteria([]);
    setCi(0);
  };
  useEffect(() => {
    if (screen !== "thinking") return;
    const t = setTimeout(() => setScreen("result"), 800);
    return () => clearTimeout(t);
  }, [screen]);

  const toggle = (name: string) =>
    setCriteria(
      criteria.some((c) => c.name === name)
        ? criteria.filter((c) => c.name !== name)
        : criteria.length < 3
          ? [...criteria, { name, weight: 3, ratings: clean.map(() => 3) }]
          : criteria,
    );
  const setCurrent = (patch: Partial<Criterion>) =>
    setCriteria(criteria.map((c, j) => (j === ci ? { ...c, ...patch } : c)));

  const progress =
    screen === "setup"
      ? 15
      : screen === "criteria"
        ? 35
        : screen === "rate"
          ? 40 + ((ci + 1) / criteria.length) * 55
          : 100;

  if (screen === "setup")
    return (
      <section className={s.flow}>
        <div className={s.progress}>
          <i style={{ width: `${progress}%` }} />
        </div>
        <DuckBuddy state="curious" />
        <h1>有哪些選項？</h1>
        <p className={s.sub}>兩到五個。完全不同類的也可以。</p>
        <div className={s.inputs}>
          {options.map((o, i) => (
            <div className={s.inputRow} key={i}>
              <b>{i + 1}</b>
              <input
                aria-label={`選項 ${i + 1}`}
                placeholder={placeholders[i] || "再一個選項"}
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
                  aria-label={`移除選項 ${i + 1}`}
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
          onClick={() => {
            setCriteria([]);
            setScreen("criteria");
          }}
        >
          幫我選 →
        </button>
        <button
          className={s.minor}
          onClick={() => setOptions(["首爾", "東京", "河內"])}
        >
          放範例看看
        </button>
      </section>
    );

  if (screen === "criteria")
    return (
      <section className={s.flow}>
        <div className={s.progress}>
          <i style={{ width: `${progress}%` }} />
        </div>
        <DuckBuddy />
        <h1>你真正在意什麼？</h1>
        <p className={s.sub}>最多挑三個。</p>
        <div className={s.cards}>
          {presets.map((p) => (
            <button
              key={p.name}
              className={`${s.card} ${criteria.some((c) => c.name === p.name) ? s.selected : ""}`}
              aria-pressed={criteria.some((c) => c.name === p.name)}
              onClick={() => toggle(p.name)}
            >
              <b>
                {p.icon} {p.name}
              </b>
              <small>{p.sub}</small>
            </button>
          ))}
        </div>
        <button
          className={s.primary}
          disabled={!criteria.length}
          onClick={() => {
            setCi(0);
            setScreen("rate");
          }}
        >
          下一步 →
        </button>
        <button className={s.back} onClick={() => setScreen("setup")}>
          ← 上一步
        </button>
      </section>
    );

  if (screen === "rate") {
    const c = criteria[ci];
    const last = ci >= criteria.length - 1;
    return (
      <section className={s.flow}>
        <div className={s.progress}>
          <i style={{ width: `${progress}%` }} />
        </div>
        <DuckBuddy state="thinking" />
        <h1>{c.name}</h1>
        <p className={s.sub}>
          {ci + 1} / {criteria.length} · 別假裝每個都一樣好
        </p>
        <div className={s.group}>
          <Pills
            label={`${c.name}對你有多重要？`}
            hints={["還好", "很重要"]}
            value={c.weight}
            onChange={(v) => setCurrent({ weight: v })}
          />
          {clean.map((o, oi) => (
            <Pills
              key={oi}
              label={`${o} 的${c.name}`}
              hints={["差", "很棒"]}
              value={c.ratings[oi] ?? 3}
              onChange={(v) =>
                setCurrent({
                  ratings: clean.map((_, k) =>
                    k === oi ? v : (c.ratings[k] ?? 3),
                  ),
                })
              }
            />
          ))}
        </div>
        <button
          className={s.primary}
          onClick={() => (last ? setScreen("thinking") : setCi(ci + 1))}
        >
          {last ? "幫我選 →" : "下一步 →"}
        </button>
        <button
          className={s.back}
          onClick={() => (ci ? setCi(ci - 1) : setScreen("criteria"))}
        >
          ← 上一步
        </button>
      </section>
    );
  }

  if (screen === "thinking" || !winner)
    return (
      <section className={s.flow}>
        <DuckBuddy state="thinking" />
        <p className={s.thinking}>算一下…</p>
      </section>
    );

  return (
    <section className={s.flow}>
      <div className={s.result}>
        <DuckBuddy state="celebrating" />
        <h1>{winner.name}</h1>
        <p className={s.message}>
          {winner.score} 分（滿分 100），這是你自己給的分數。
        </p>
        <div className={s.ranking}>
          {results.slice(1).map((r, i) => (
            <div className={s.rank} key={i}>
              <b>{i + 2}</b>
              <div>
                <h2>{r.name}</h2>
              </div>
              <span>{r.score}</span>
            </div>
          ))}
        </div>
        <details className={s.details}>
          <summary>看計算過程</summary>
          {criteria.map((c, i) => (
            <div key={i}>
              <span>
                {c.name} × {c.weight}
              </span>
              <b>
                {clean.map((o, i) => `${o} ${c.ratings[i] ?? 3}`).join(" · ")}
              </b>
            </div>
          ))}
        </details>
        <button
          className={s.primary}
          onClick={() => {
            save("⚖️", "比較結果", winner.name, "compare");
            reset();
          }}
        >
          就這麼決定 ✓
        </button>
      </div>
    </section>
  );
}
