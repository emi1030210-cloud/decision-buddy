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
    title: () => "你是不是已經有功能差不多的東西了？",
    choices: [
      {
        label: "沒有",
        sub: "我真的沒有",
        value: 20,
        reaction: "喔！好吧…",
        duck: "happy",
      },
      {
        label: "算有吧",
        sub: "類似，但不太一樣",
        value: 8,
        reaction: "嗯。「算有」是多有？👀",
        duck: "thinking",
      },
      {
        label: "有",
        sub: "我確實已經有了",
        value: -15,
        reaction: "…有意思。",
        duck: "suspicious",
      },
    ],
  },
  condition: {
    title: () => "那你手上那個…狀況如何？",
    choices: [
      {
        icon: "✨",
        label: "好得很",
        sub: "完全沒問題",
        value: -20,
        reaction: "喔，是喔。",
        duck: "suspicious",
      },
      {
        icon: "😐",
        label: "還可以",
        sub: "能用，但不太喜歡",
        value: -8,
        reaction: "也是啦…",
        duck: "thinking",
      },
      {
        icon: "🩹",
        label: "快撐不住了",
        sub: "差不多到極限了",
        value: 12,
        reaction: "好，這點很關鍵。",
        duck: "concerned",
      },
      {
        icon: "🪦",
        label: "已經壞了",
        sub: "它盡忠職守過了",
        value: 20,
        reaction: "喔喔。",
        duck: "shocked",
      },
    ],
  },
  wanted: {
    title: () => "你想要這個多久了？",
    choices: [
      {
        icon: "👀",
        label: "剛剛才看到",
        sub: "就…今天",
        value: -15,
        reaction: "這也太快。",
        duck: "suspicious",
      },
      {
        icon: "🌱",
        label: "幾天",
        sub: "一直放在心上",
        value: -5,
        reaction: "嗯…記下了。",
        duck: "thinking",
      },
      {
        icon: "🗓️",
        label: "幾個禮拜",
        sub: "我認真想過了",
        value: 8,
        reaction: "好，這是有淵源的。",
        duck: "thinking",
      },
      {
        icon: "🫡",
        label: "一個月以上",
        sub: "這不是臨時起意",
        value: 15,
        reaction: "喔，你想很久了。",
        duck: "happy",
      },
    ],
  },
  usage: {
    title: () => "務實一點。你實際上會多常用？",
    choices: [
      {
        icon: "🫥",
        label: "幾乎不會",
        sub: "那是我幻想中的自己",
        value: -20,
        reaction: "…謝謝你這麼誠實。",
        duck: "judging",
      },
      {
        icon: "🌙",
        label: "偶爾",
        sub: "一個月幾次吧",
        value: -5,
        reaction: "好，偶爾也算。",
        duck: "thinking",
      },
      {
        icon: "📅",
        label: "每週都會",
        sub: "絕對用得到",
        value: 12,
        reaction: "這就對了。",
        duck: "happy",
      },
      {
        icon: "⭐",
        label: "一直都會",
        sub: "會變成我生活的一部分",
        value: 20,
        reaction: "好，這理由很有力。",
        duck: "happy",
      },
    ],
  },
  budget: {
    title: (p) => `NT$${Number(p || 0).toLocaleString()} 對你來說有多痛？`,
    choices: [
      {
        icon: "😌",
        label: "完全不痛",
        sub: "不影響我的預算",
        value: 15,
        reaction: "錢包平安。很好。",
        duck: "happy",
      },
      {
        icon: "🙂",
        label: "有一點",
        sub: "會有感覺，但還好",
        value: 7,
        reaction: "可以接受。",
        duck: "neutral",
      },
      {
        icon: "😬",
        label: "有點痛",
        sub: "別的地方要省一點",
        value: -10,
        reaction: "好…這不是小事。",
        duck: "concerned",
      },
      {
        icon: "💀",
        label: "根本不該買",
        sub: "我的戶頭在求我住手",
        value: -25,
        reaction: "欸，冷靜。",
        duck: "shocked",
      },
    ],
  },
  reason: {
    title: () => "最後一題。你到底為什麼想要？",
    choices: [
      {
        icon: "🧰",
        label: "我真的需要",
        sub: "它解決真正的問題",
        value: 20,
        reaction: "合理。",
        duck: "happy",
      },
      {
        icon: "✨",
        label: "生活會變好",
        sub: "不是必需，但真的實用",
        value: 12,
        reaction: "這我可以接受。",
        duck: "happy",
      },
      {
        icon: "❤️",
        label: "想很久了",
        sub: "我知道我會很開心",
        value: 8,
        reaction: "老實說？有道理。",
        duck: "happy",
      },
      {
        icon: "🏷️",
        label: "在特價",
        sub: "被折扣打動了",
        value: -10,
        reaction: "那原價你還會想要嗎？👀",
        duck: "suspicious",
      },
      {
        icon: "🎀",
        label: "很可愛",
        sub: "理由…大概就是這個",
        value: -5,
        reaction: "…是真的有點可愛啦。",
        duck: "thinking",
      },
      {
        icon: "🤷",
        label: "不知道",
        sub: "資本主義贏了",
        value: -15,
        reaction: "至少我們有自知之明。",
        duck: "judging",
      },
    ],
  },
};
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
const reasonCopy: Record<string, Record<string, [string, string, string]>> = {
  owns: {
    沒有: ["🧺", "家裡沒有重複的", "你並沒有功能相同的東西。"],
    算有吧: ["↔️", "有一點重疊", "你有類似的，但不完全一樣。"],
    有: ["👀", "你已經有了", "已經有東西在做同樣的事。"],
  },
  condition: {
    好得很: ["✨", "現在那個完全沒問題", "你手上的東西其實沒壞。"],
    還可以: ["😐", "現在那個還能用", "不完美，但還堪用。"],
    快撐不住了: ["🩹", "現在那個快壞了", "看起來確實該換了。"],
    已經壞了: ["🪦", "舊的已經功成身退", "換掉非常合理。"],
  },
  wanted: {
    剛剛才看到: ["👀", "你才剛發現它", "衝動購物的氣息很濃。"],
    幾天: ["🌱", "還很新鮮", "幾天可能不夠你想清楚。"],
    幾個禮拜: ["🗓️", "你想過了", "這不像是臨時起意。"],
    一個月以上: ["🗓️", "你想很久了", "顯然不是一閃而過的念頭。"],
  },
  usage: {
    幾乎不會: ["🫥", "你大概不會常用", "你自己選了「幾乎不會」。"],
    偶爾: ["🌙", "只會偶爾用到", "它可能會閒置不少時間。"],
    每週都會: ["📅", "你真的會用它", "每週都用，這筆錢有意義。"],
    一直都會: ["⭐", "它值回票價", "你說它會變成生活的一部分。"],
  },
  budget: {
    完全不痛: ["😌", "你的預算撐得住", "這個價格不會真的影響你。"],
    有一點: ["🙂", "價格還在可控範圍", "會有感覺，但緩得過來。"],
    有點痛: ["😬", "這個價格確實會痛", "你得在別的地方省下來。"],
    根本不該買: ["💀", "你的錢包在求你住手", "這會嚴重壓縮你的預算。"],
  },
  reason: {
    我真的需要: ["🧰", "它解決真正的問題", "這是需求，不只是被閃到。"],
    生活會變好: ["✨", "它有實際價值", "你預期日常會確實變好。"],
    想很久了: ["❤️", "這份想要一直沒消失", "你知道自己會很享受擁有它。"],
    在特價: ["🏷️", "折扣佔了很大因素", "光是特價不構成購買理由。"],
    很可愛: ["🎀", "可愛撐起了整個理由", "確實迷人。必要性就還好。"],
    不知道: ["🤷", "說不出明確理由", "這局可能是資本主義贏了。"],
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
