"use client";
import { useEffect, useState } from "react";
import { DuckBuddy } from "./BuyFlow";
import s from "./Flow.module.css";
import { rankTasks, Task } from "@/lib/decisions";

const deadlines: { label: string; sub: string; value: number }[] = [
  { label: "Today", sub: "it's today", value: 1 },
  { label: "Tomorrow", sub: "1 day", value: 2 },
  { label: "This week", sub: "3 days", value: 3 },
  { label: "Whenever", sub: "5+ days", value: 5 },
];
const durations: { label: string; sub: string; value: number }[] = [
  { label: "Quick", sub: "30 min", value: 0.5 },
  { label: "A bit", sub: "1 hour", value: 1 },
  { label: "A while", sub: "2 hours", value: 2 },
  { label: "All of it", sub: "3+ hours", value: 3 },
];
const scale = [1, 2, 3, 4, 5];
const timeChoices: {
  icon: string;
  label: string;
  sub: string;
  value: number;
}[] = [
  { icon: "⏱️", label: "30 minutes", sub: "A pocket of time", value: 0.5 },
  { icon: "🕐", label: "An hour", sub: "Enough for one thing", value: 1 },
  { icon: "🕑", label: "Two hours", sub: "A proper block", value: 2 },
  { icon: "🌤️", label: "The afternoon", sub: "3+ hours", value: 3 },
];
const emptyTask = (): Task => ({
  name: "",
  deadline: 2,
  duration: 1,
  importance: 3,
  energy: 3,
});
const placeholders = [
  "Finish the assignment",
  "Reply to that email",
  "Laundry",
];
const example: Task[] = [
  {
    name: "Finish assignment",
    deadline: 2,
    duration: 2,
    importance: 5,
    energy: 5,
  },
  {
    name: "Apply for internship",
    deadline: 5,
    duration: 1,
    importance: 5,
    energy: 3,
  },
  { name: "Workout", deadline: 1, duration: 1, importance: 3, energy: 3 },
];

function Pills<T extends number>({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: { label: string; sub?: string; value: T }[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <div className={s.row} role="group" aria-label={label}>
      <span>{label}</span>
      {/* four labelled choices, not the 1-5 scales: these get two-up on phones */}
      <div className={`${s.pills} ${options.length <= 4 ? s.wide : ""}`}>
        {options.map((o) => (
          <button
            key={o.value}
            className={`${s.pill} ${value === o.value ? s.on : ""}`}
            aria-pressed={value === o.value}
            onClick={() => onChange(o.value)}
          >
            {o.label}
            {o.sub && <small>{o.sub}</small>}
          </button>
        ))}
      </div>
    </div>
  );
}

export default function TaskFlow({
  save,
}: {
  save: (type: string, title: string, result: string, mode: "tasks") => void;
}) {
  const [screen, setScreen] = useState<
    "setup" | "detail" | "time" | "thinking" | "result"
  >("setup");
  const [tasks, setTasks] = useState<Task[]>([emptyTask(), emptyTask()]);
  const [ti, setTi] = useState(0);
  const [available, setAvailable] = useState(2);
  // trimmed here so a stray space never reaches the ranking, the saved
  // history entry or the next screen's heading — same as the other flows
  const named = tasks
    .filter((t) => t.name.trim())
    .map((t) => ({ ...t, name: t.name.trim() }));
  const ranked = rankTasks(named, available);
  const update = (i: number, patch: Partial<Task>) =>
    setTasks(tasks.map((t, j) => (j === i ? { ...t, ...patch } : t)));
  const reset = () => {
    setScreen("setup");
    setTasks([emptyTask(), emptyTask()]);
    setTi(0);
    setAvailable(2);
  };
  useEffect(() => {
    if (screen !== "thinking") return;
    const t = setTimeout(() => setScreen("result"), 800);
    return () => clearTimeout(t);
  }, [screen]);

  const progress =
    screen === "setup"
      ? 12
      : screen === "detail"
        ? 20 + ((ti + 1) / (named.length + 1)) * 60
        : 92;

  if (screen === "setup")
    return (
      <section className={s.flow}>
        <div className={s.progress}>
          <i style={{ width: `${progress}%` }} />
        </div>
        <DuckBuddy state="curious" />
        <h1>Dump the list.</h1>
        <p className={s.sub}>
          Two to six things. We'll turn the panic into an order.
        </p>
        <div className={s.inputs}>
          {tasks.map((t, i) => (
            <div className={s.inputRow} key={i}>
              <b>{i + 1}</b>
              <input
                aria-label={`Task ${i + 1}`}
                placeholder={placeholders[i] || "One more thing"}
                value={t.name}
                onChange={(e) => update(i, { name: e.target.value })}
              />
              {tasks.length > 2 && (
                <button
                  className={s.remove}
                  aria-label={`Remove task ${i + 1}`}
                  onClick={() => setTasks(tasks.filter((_, j) => j !== i))}
                >
                  ×
                </button>
              )}
            </div>
          ))}
        </div>
        {tasks.length < 6 && (
          <button
            className={s.add}
            onClick={() => setTasks([...tasks, emptyTask()])}
          >
            + Add another
          </button>
        )}
        <button
          className={s.primary}
          disabled={named.length < 2}
          onClick={() => {
            setTasks(named);
            setTi(0);
            setScreen("detail");
          }}
        >
          Sort this out →
        </button>
        <button className={s.minor} onClick={() => setTasks(example)}>
          Try an example
        </button>
      </section>
    );

  if (screen === "detail") {
    const t = tasks[ti];
    const last = ti >= tasks.length - 1;
    return (
      <section className={s.flow}>
        <div className={s.progress}>
          <i style={{ width: `${progress}%` }} />
        </div>
        <DuckBuddy state="thinking" />
        <h1>Tell me about it.</h1>
        <p className={s.sub}>
          {ti + 1} of {tasks.length} · be honest, the duck can tell
        </p>
        <div className={s.group}>
          <p className={s.groupTitle}>{t.name}</p>
          <Pills
            label="When is it due?"
            options={deadlines}
            value={t.deadline}
            onChange={(v) => update(ti, { deadline: v })}
          />
          <Pills
            label="How long will it take?"
            options={durations}
            value={t.duration}
            onChange={(v) => update(ti, { duration: v })}
          />
          <Pills
            label="How much does it matter?"
            options={scale.map((n) => ({
              label: String(n),
              sub: n === 1 ? "meh" : n === 5 ? "a lot" : undefined,
              value: n,
            }))}
            value={t.importance}
            onChange={(v) => update(ti, { importance: v })}
          />
          <Pills
            label="How much energy does it need?"
            options={scale.map((n) => ({
              label: String(n),
              sub: n === 1 ? "easy" : n === 5 ? "draining" : undefined,
              value: n,
            }))}
            value={t.energy}
            onChange={(v) => update(ti, { energy: v })}
          />
        </div>
        <button
          className={s.primary}
          onClick={() => (last ? setScreen("time") : setTi(ti + 1))}
        >
          {last ? "Almost there →" : "Next task →"}
        </button>
        <button
          className={s.back}
          onClick={() => (ti ? setTi(ti - 1) : setScreen("setup"))}
        >
          ← Back
        </button>
      </section>
    );
  }

  if (screen === "time")
    return (
      <section className={s.flow}>
        <div className={s.progress}>
          <i style={{ width: `${progress}%` }} />
        </div>
        <DuckBuddy state="curious" />
        <h1>How much time do you have right now?</h1>
        <p className={s.sub}>One tap. Don't overthink it.</p>
        <div className={s.cards}>
          {timeChoices.map((c) => (
            <button
              key={c.value}
              className={s.card}
              onClick={() => {
                setAvailable(c.value);
                setScreen("thinking");
              }}
            >
              <b>
                {c.icon} {c.label}
              </b>
              <small>{c.sub}</small>
            </button>
          ))}
        </div>
        <button className={s.back} onClick={() => setScreen("detail")}>
          ← Back
        </button>
      </section>
    );

  if (screen === "thinking")
    return (
      <section className={s.flow}>
        <DuckBuddy state="thinking" />
        <p className={s.thinking}>Lining them up…</p>
      </section>
    );

  const fits = ranked.filter((t) => t.duration <= available).length;
  return (
    <section className={s.flow}>
      <div className={s.result}>
        <DuckBuddy state="celebrating" />
        <h1>Here's the move.</h1>
        <p className={s.message}>Your deadline has entered the chat.</p>
        <div className={s.ranking}>
          {ranked.map((t, i) => (
            <div className={`${s.rank} ${i === 0 ? s.top : ""}`} key={i}>
              <b>{i === 0 ? "🔥" : i + 1}</b>
              <div>
                <h2>{t.name}</h2>
                <small>
                  {i === 0 ? "Do this now." : i === 1 ? "Then this." : "Later."}
                  {" · "}
                  {t.deadline === 1 ? "Due today" : `Due in ${t.deadline} days`}
                  {" · "}
                  {t.duration}h
                </small>
              </div>
            </div>
          ))}
        </div>
        <div className={s.focus}>
          {fits
            ? "Start with a 25-minute focus session →"
            : "Nothing fits the time you have — start the top one anyway →"}
        </div>
        <details className={s.details}>
          <summary>Why this order?</summary>
          {ranked.map((t, i) => (
            <div key={i}>
              <span>{t.name}</span>
              <b>{t.score}</b>
            </div>
          ))}
        </details>
        <button
          className={s.primary}
          onClick={() => {
            save(
              "🔥",
              "Today's priorities",
              ranked.map((t) => t.name).join(" → "),
              "tasks",
            );
            reset();
          }}
        >
          That's the plan ✓
        </button>
      </div>
    </section>
  );
}
