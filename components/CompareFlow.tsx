"use client";
import { useEffect, useState } from "react";
import { DuckBuddy } from "./BuyFlow";
import s from "./Flow.module.css";
import { compare, Criterion } from "@/lib/decisions";

const presets: { icon: string; name: string; sub: string }[] = [
  { icon: "💰", name: "Price", sub: "What it costs me" },
  { icon: "😊", name: "Enjoyment", sub: "How much I'd like it" },
  { icon: "⭐", name: "Quality", sub: "How good it actually is" },
  { icon: "⏱️", name: "Time", sub: "How long it takes" },
  { icon: "💪", name: "Effort", sub: "How much work it is" },
  { icon: "📈", name: "Long-term", sub: "How it looks in a year" },
];
const scale = [1, 2, 3, 4, 5];
const placeholders = ["Seoul", "Tokyo", "Hanoi"];

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
        <h1>What are the options?</h1>
        <p className={s.sub}>Two to five. Apples and oranges allowed.</p>
        <div className={s.inputs}>
          {options.map((o, i) => (
            <div className={s.inputRow} key={i}>
              <b>{i + 1}</b>
              <input
                aria-label={`Option ${i + 1}`}
                placeholder={placeholders[i] || "Another option"}
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
                  aria-label={`Remove option ${i + 1}`}
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
          onClick={() => {
            setCriteria([]);
            setScreen("criteria");
          }}
        >
          Help me choose →
        </button>
        <button
          className={s.minor}
          onClick={() => setOptions(["Seoul", "Tokyo", "Hanoi"])}
        >
          Try an example
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
        <h1>What actually matters?</h1>
        <p className={s.sub}>Pick up to three.</p>
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
          Next →
        </button>
        <button className={s.back} onClick={() => setScreen("setup")}>
          ← Back
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
        <h1>{c.name}.</h1>
        <p className={s.sub}>
          {ci + 1} of {criteria.length} · no pretending they're all equal
        </p>
        <div className={s.group}>
          <Pills
            label={`How much does ${c.name.toLowerCase()} matter?`}
            hints={["barely", "a lot"]}
            value={c.weight}
            onChange={(v) => setCurrent({ weight: v })}
          />
          {clean.map((o, oi) => (
            <Pills
              key={o}
              label={`${o} on ${c.name.toLowerCase()}`}
              hints={["weak", "great"]}
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
          {last ? "Choose for me →" : "Next →"}
        </button>
        <button
          className={s.back}
          onClick={() => (ci ? setCi(ci - 1) : setScreen("criteria"))}
        >
          ← Back
        </button>
      </section>
    );
  }

  if (screen === "thinking" || !winner)
    return (
      <section className={s.flow}>
        <DuckBuddy state="thinking" />
        <p className={s.thinking}>Doing the math…</p>
      </section>
    );

  return (
    <section className={s.flow}>
      <div className={s.result}>
        <DuckBuddy state="celebrating" />
        <h1>{winner.name}.</h1>
        <p className={s.message}>
          {winner.score} out of 100, by your own numbers.
        </p>
        <div className={s.ranking}>
          {results.slice(1).map((r, i) => (
            <div className={s.rank} key={r.name}>
              <b>{i + 2}</b>
              <div>
                <h2>{r.name}</h2>
              </div>
              <span>{r.score}</span>
            </div>
          ))}
        </div>
        <details className={s.details}>
          <summary>Show the math</summary>
          {criteria.map((c) => (
            <div key={c.name}>
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
            save("⚖️", "Comparison", winner.name, "compare");
            reset();
          }}
        >
          Decision made ✓
        </button>
      </div>
    </section>
  );
}
