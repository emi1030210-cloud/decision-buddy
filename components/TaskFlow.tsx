"use client";
import { useEffect, useState } from "react";
import { DuckBuddy } from "./BuyFlow";
import s from "./Flow.module.css";
import { rankTasks, Task } from "@/lib/decisions";

const deadlines: { label: string; sub: string; value: number }[] = [
  { label: "今天", sub: "就是今天", value: 1 },
  { label: "明天", sub: "1 天", value: 2 },
  { label: "這禮拜", sub: "3 天", value: 3 },
  { label: "都可以", sub: "5 天以上", value: 5 },
];
const durations: { label: string; sub: string; value: number }[] = [
  { label: "很快", sub: "30 分鐘", value: 0.5 },
  { label: "一下下", sub: "1 小時", value: 1 },
  { label: "有點久", sub: "2 小時", value: 2 },
  { label: "整個下午", sub: "3 小時以上", value: 3 },
];
const scale = [1, 2, 3, 4, 5];
const timeChoices: {
  icon: string;
  label: string;
  sub: string;
  value: number;
}[] = [
  { icon: "⏱️", label: "30 分鐘", sub: "一小段空檔", value: 0.5 },
  { icon: "🕐", label: "一小時", sub: "夠做完一件事", value: 1 },
  { icon: "🕑", label: "兩小時", sub: "一個完整時段", value: 2 },
  { icon: "🌤️", label: "一整個下午", sub: "3 小時以上", value: 3 },
];
const emptyTask = (): Task => ({
  name: "",
  deadline: 2,
  duration: 1,
  importance: 3,
  energy: 3,
});
const placeholders = ["把作業寫完", "回那封信", "洗衣服"];
const example: Task[] = [
  {
    name: "把作業寫完",
    deadline: 2,
    duration: 2,
    importance: 5,
    energy: 5,
  },
  {
    name: "投實習履歷",
    deadline: 5,
    duration: 1,
    importance: 5,
    energy: 3,
  },
  { name: "運動", deadline: 1, duration: 1, importance: 3, energy: 3 },
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
        <h1>全部列出來。</h1>
        <p className={s.sub}>兩到六件。我們把這團慌亂排出順序。</p>
        <div className={s.inputs}>
          {tasks.map((t, i) => (
            <div className={s.inputRow} key={i}>
              <b>{i + 1}</b>
              <input
                aria-label={`事情 ${i + 1}`}
                placeholder={placeholders[i] || "還有一件"}
                value={t.name}
                onChange={(e) => update(i, { name: e.target.value })}
              />
              {tasks.length > 2 && (
                <button
                  className={s.remove}
                  aria-label={`移除事情 ${i + 1}`}
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
            ＋ 再加一件
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
          幫我排順序 →
        </button>
        <button className={s.minor} onClick={() => setTasks(example)}>
          放範例看看
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
        <h1>說說這件事。</h1>
        <p className={s.sub}>
          {ti + 1} / {tasks.length} · 誠實一點，鴨子看得出來
        </p>
        <div className={s.group}>
          <p className={s.groupTitle}>{t.name}</p>
          <Pills
            label="什麼時候要交？"
            options={deadlines}
            value={t.deadline}
            onChange={(v) => update(ti, { deadline: v })}
          />
          <Pills
            label="要花多久？"
            options={durations}
            value={t.duration}
            onChange={(v) => update(ti, { duration: v })}
          />
          <Pills
            label="這件事有多重要？"
            options={scale.map((n) => ({
              label: String(n),
              sub: n === 1 ? "還好" : n === 5 ? "很重要" : undefined,
              value: n,
            }))}
            value={t.importance}
            onChange={(v) => update(ti, { importance: v })}
          />
          <Pills
            label="需要多少力氣？"
            options={scale.map((n) => ({
              label: String(n),
              sub: n === 1 ? "輕鬆" : n === 5 ? "很累" : undefined,
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
          {last ? "快好了 →" : "下一件 →"}
        </button>
        <button
          className={s.back}
          onClick={() => (ti ? setTi(ti - 1) : setScreen("setup"))}
        >
          ← 上一步
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
        <h1>你現在有多少時間？</h1>
        <p className={s.sub}>點一下就好，別想太多。</p>
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
          ← 上一步
        </button>
      </section>
    );

  if (screen === "thinking")
    return (
      <section className={s.flow}>
        <DuckBuddy state="thinking" />
        <p className={s.thinking}>排一下順序…</p>
      </section>
    );

  const fits = ranked.filter((t) => t.duration <= available).length;
  return (
    <section className={s.flow}>
      <div className={s.result}>
        <DuckBuddy state="celebrating" />
        <h1>就這樣做。</h1>
        <p className={s.message}>你的截止日已加入戰局。</p>
        <div className={s.ranking}>
          {ranked.map((t, i) => (
            <div className={`${s.rank} ${i === 0 ? s.top : ""}`} key={i}>
              <b>{i === 0 ? "🔥" : i + 1}</b>
              <div>
                <h2>{t.name}</h2>
                <small>
                  {i === 0 ? "現在就做" : i === 1 ? "接著這件" : "之後再說"}
                  {" · "}
                  {t.deadline === 1 ? "今天要交" : `還有 ${t.deadline} 天`}
                  {" · "}
                  {t.duration} 小時
                </small>
              </div>
            </div>
          ))}
        </div>
        <div className={s.focus}>
          {fits
            ? "先來個 25 分鐘的專注時段 →"
            : "沒有一件塞得進你的時間 —— 還是先開第一件 →"}
        </div>
        <details className={s.details}>
          <summary>為什麼是這個順序？</summary>
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
              "今天的優先順序",
              ranked.map((t) => t.name).join(" → "),
              "tasks",
            );
            reset();
          }}
        >
          就照這樣 ✓
        </button>
      </div>
    </section>
  );
}
