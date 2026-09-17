"use client";
import { useEffect, useMemo, useState } from "react";
import s from "./BuyFlow.module.css";
import { scoreBuy } from "@/lib/decisions";

export type DuckState =
  | "neutral"
  | "curious"
  | "thinking"
  | "suspicious"
  | "concerned"
  | "shocked"
  | "happy"
  | "judging"
  | "celebrating"
  | "sleeping"
  | "i-knew-it";
type Choice = {
  label: string;
  sub: string;
  icon?: string;
  value: number;
  reaction: string;
  duck: DuckState;
};
type Key = "owns" | "condition" | "wanted" | "usage" | "budget" | "reason";
const questions: Record<
  Key,
  { title: (price: string) => string; choices: Choice[] }
> = {
  owns: {
    title: () =>
      "Do you already own something that does basically the same thing?",
    choices: [
      {
        label: "Nope",
        sub: "I actually don’t have one",
        value: 20,
        reaction: "Oh! Okay...",
        duck: "happy",
      },
      {
        label: "Kind of",
        sub: "Similar, but not quite",
        value: 8,
        reaction: "Hmm. Define “kind of.” 👀",
        duck: "thinking",
      },
      {
        label: "Yep",
        sub: "I definitely already own this",
        value: -15,
        reaction: "...interesting.",
        duck: "suspicious",
      },
    ],
  },
  condition: {
    title: () => "And the one you already have... how’s it doing?",
    choices: [
      {
        icon: "✨",
        label: "Totally fine",
        sub: "Nothing wrong with it",
        value: -20,
        reaction: "Oh really.",
        duck: "suspicious",
      },
      {
        icon: "😐",
        label: "It’s okay",
        sub: "Works, but I don’t love it",
        value: -8,
        reaction: "Fair...",
        duck: "thinking",
      },
      {
        icon: "🩹",
        label: "Barely surviving",
        sub: "We’re approaching the end",
        value: 12,
        reaction: "Okay, that’s relevant.",
        duck: "concerned",
      },
      {
        icon: "🪦",
        label: "Basically dead",
        sub: "It has served its country",
        value: 20,
        reaction: "OH.",
        duck: "shocked",
      },
    ],
  },
  wanted: {
    title: () => "How long have you wanted this?",
    choices: [
      {
        icon: "👀",
        label: "I literally just saw it",
        sub: "Like... today",
        value: -15,
        reaction: "That was fast.",
        duck: "suspicious",
      },
      {
        icon: "🌱",
        label: "A few days",
        sub: "It’s been on my mind",
        value: -5,
        reaction: "Hmm... noted.",
        duck: "thinking",
      },
      {
        icon: "🗓️",
        label: "A few weeks",
        sub: "I’ve thought about it properly",
        value: 8,
        reaction: "Okay, so this has history.",
        duck: "thinking",
      },
      {
        icon: "🫡",
        label: "A month+",
        sub: "This is not a random impulse",
        value: 15,
        reaction: "Oh, you’ve been thinking about this.",
        duck: "happy",
      },
    ],
  },
  usage: {
    title: () => "Be realistic. How often would you actually use it?",
    choices: [
      {
        icon: "🫥",
        label: "Almost never",
        sub: "Mostly for the fantasy version of me",
        value: -20,
        reaction: "... Thank you for your honesty.",
        duck: "judging",
      },
      {
        icon: "🌙",
        label: "Sometimes",
        sub: "Maybe a few times a month",
        value: -5,
        reaction: "Okay. Occasionally counts.",
        duck: "thinking",
      },
      {
        icon: "📅",
        label: "Every week",
        sub: "It would definitely get used",
        value: 12,
        reaction: "Now we’re talking.",
        duck: "happy",
      },
      {
        icon: "⭐",
        label: "All the time",
        sub: "This would become part of my life",
        value: 20,
        reaction: "Okay, that’s a strong argument.",
        duck: "happy",
      },
    ],
  },
  budget: {
    title: (p) =>
      `And how much is NT$${Number(p || 0).toLocaleString()} going to hurt?`,
    choices: [
      {
        icon: "😌",
        label: "Totally fine",
        sub: "Won’t affect my budget",
        value: 15,
        reaction: "Wallet survives. Good.",
        duck: "happy",
      },
      {
        icon: "🙂",
        label: "A little",
        sub: "I’ll notice it, but it’s okay",
        value: 7,
        reaction: "Manageable.",
        duck: "neutral",
      },
      {
        icon: "😬",
        label: "Kinda hurts",
        sub: "I’d have to cut back somewhere",
        value: -10,
        reaction: "Okay... that’s not nothing.",
        duck: "concerned",
      },
      {
        icon: "💀",
        label: "Financially irresponsible",
        sub: "My bank account is begging me not to",
        value: -25,
        reaction: "BESTIE.",
        duck: "shocked",
      },
    ],
  },
  reason: {
    title: () => "Last question. Why do you actually want it?",
    choices: [
      {
        icon: "🧰",
        label: "I genuinely need it",
        sub: "It solves a real problem",
        value: 20,
        reaction: "Valid.",
        duck: "happy",
      },
      {
        icon: "✨",
        label: "It would improve my life",
        sub: "Not essential, but genuinely useful",
        value: 12,
        reaction: "I can work with that.",
        duck: "happy",
      },
      {
        icon: "❤️",
        label: "I’ve wanted it forever",
        sub: "I know I’d enjoy having it",
        value: 8,
        reaction: "Honestly? Fair.",
        duck: "happy",
      },
      {
        icon: "🏷️",
        label: "It’s on sale",
        sub: "The discount got me",
        value: -10,
        reaction: "Would you want it at full price though? 👀",
        duck: "suspicious",
      },
      {
        icon: "🎀",
        label: "It’s cute",
        sub: "That’s... basically the reason",
        value: -5,
        reaction: "...it IS kinda cute.",
        duck: "thinking",
      },
      {
        icon: "🤷",
        label: "I don’t know",
        sub: "Capitalism won",
        value: -15,
        reaction: "At least we’re self-aware.",
        duck: "judging",
      },
    ],
  },
};
export function DuckBuddy({ state = "neutral" }: { state?: DuckState }) {
  return (
    <div
      className={`${s.duck} ${s[state]}`}
      aria-label={`Duck Buddy is ${state}`}
    >
      <i className={s.wing} />
      <i className={s.wing} />
      <b className={s.eye} />
      <b className={s.eye} />
      <span className={s.beak} />
      {state === "curious" && <em className={s.prop}>?</em>}
    </div>
  );
}
const reasonCopy: Record<string, Record<string, [string, string, string]>> = {
  owns: {
    Nope: [
      "🧺",
      "No duplicate hiding at home",
      "You don’t already own an equivalent.",
    ],
    "Kind of": [
      "↔️",
      "There is some overlap",
      "You own something similar, but it isn’t quite the same.",
    ],
    Yep: [
      "👀",
      "You already own this",
      "There’s already an equivalent doing this job.",
    ],
  },
  condition: {
    "Totally fine": [
      "✨",
      "Your current one is completely fine",
      "Nothing is actually wrong with what you own.",
    ],
    "It’s okay": [
      "😐",
      "Your current one still works",
      "It isn’t perfect, but it remains usable.",
    ],
    "Barely surviving": [
      "🩹",
      "Your current one is dying",
      "This is starting to look like a replacement.",
    ],
    "Basically dead": [
      "🪦",
      "The old one has done its time",
      "Replacing it makes a lot of sense.",
    ],
  },
  wanted: {
    "I literally just saw it": [
      "👀",
      "You just discovered it",
      "This has strong impulse-purchase energy.",
    ],
    "A few days": [
      "🌱",
      "This is still pretty new",
      "A few days may not be enough time to know.",
    ],
    "A few weeks": [
      "🗓️",
      "You’ve thought about it",
      "This doesn’t look like a random impulse.",
    ],
    "A month+": [
      "🗓️",
      "You’ve wanted it for a while",
      "This clearly isn’t a passing thought.",
    ],
  },
  usage: {
    "Almost never": [
      "🫥",
      "You probably won’t use it much",
      "You selected “almost never.”",
    ],
    Sometimes: [
      "🌙",
      "Use would be occasional",
      "It may spend a fair bit of time sitting around.",
    ],
    "Every week": [
      "📅",
      "You’ll actually use it",
      "Weekly use gives this purchase a real purpose.",
    ],
    "All the time": [
      "⭐",
      "This would earn its keep",
      "You said it would become part of your life.",
    ],
  },
  budget: {
    "Totally fine": [
      "😌",
      "Your budget can handle it",
      "The price won’t meaningfully affect your spending.",
    ],
    "A little": [
      "🙂",
      "The price is manageable",
      "You’ll notice it, but your budget should recover.",
    ],
    "Kinda hurts": [
      "😬",
      "The price actually hurts",
      "You would need to cut back somewhere else.",
    ],
    "Financially irresponsible": [
      "💀",
      "Your wallet is begging you not to",
      "This would seriously strain your budget.",
    ],
  },
  reason: {
    "I genuinely need it": [
      "🧰",
      "It solves a real problem",
      "This is a need, not just a shiny distraction.",
    ],
    "It would improve my life": [
      "✨",
      "It has genuine value",
      "You expect a meaningful everyday improvement.",
    ],
    "I’ve wanted it forever": [
      "❤️",
      "The desire has stuck",
      "You know you would enjoy owning it.",
    ],
    "It’s on sale": [
      "🏷️",
      "The discount is doing some work",
      "A sale alone isn’t a reason to buy.",
    ],
    "It’s cute": [
      "🎀",
      "Cute is carrying the argument",
      "Charming, yes. Necessary, less clear.",
    ],
    "I don’t know": [
      "🤷",
      "There isn’t a clear reason",
      "Capitalism may have won this round.",
    ],
  },
};
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
      answers.owns?.label === "Nope"
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
    setThinkLine("Hmm...");
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
      c.label === "Financially irresponsible" ? 700 : 480,
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
        <h1 className={s.question}>Okay, what are we thinking about buying?</h1>
        <p className={s.helper}>No judgment. Yet.</p>
        <div className={s.setup}>
          <label className={s.field}>
            Item name
            <input
              placeholder="Running shoes"
              value={item}
              onChange={(e) => setItem(e.target.value)}
            />
          </label>
          <label className={s.field}>
            Price (NT$)
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
            Let’s talk about it →
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
      verdict === "BUY IT"
        ? ["BUY IT.", "Yeah, this one makes sense.", "happy"]
        : verdict === "WAIT 7 DAYS"
          ? ["WAIT A LITTLE.", "You want it. Just maybe not today.", "thinking"]
          : [
              "MAYBE DON’T.",
              "I don’t think this one is worth it.",
              "suspicious",
            ];
    if (rejected)
      return (
        <section className={s.flow}>
          <div className={`${s.verdict} ${s.rejection}`}>
            <DuckBuddy state="i-knew-it" />
            <h1>Oh? 👀</h1>
            <p>Maybe you already knew what you wanted.</p>
            <div className={s.verdictActions}>
              <button
                className={s.save}
                onClick={() => {
                  setRejected(false);
                  setScreen("questions");
                  setIndex(0);
                }}
              >
                Change my answers
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
            <summary>Why this result?</summary>
            <h3>Why?</h3>
            <ul>
              {rankedReasons.slice(0, 4).map(({ key, choice, copy: r }) => (
                <li key={key}>
                  {choice.value >= 0 ? "✓" : "−"} {r[1]}
                </li>
              ))}
            </ul>
            <p>
              <b>Buddy score: {score}</b>
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
              Done ✓
            </button>
            <button className={s.textAction} onClick={() => setRejected(true)}>
              Hmm... I disagree
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
      <p className={s.helper}>
        {reaction || "Pick the honest answer. The duck can tell."}
      </p>
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
