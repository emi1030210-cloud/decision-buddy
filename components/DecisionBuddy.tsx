"use client";
import { useEffect, useRef, useState } from "react";
import BuyFlow from "./BuyFlow";
import FoodFlow from "./FoodFlow";
import TaskFlow from "./TaskFlow";
import CompareFlow from "./CompareFlow";
import { Mascot } from "./Mascot";
import { KEY, isMode, newId, readHistory, writeHistory } from "@/lib/history";
import type { Entry, Mode } from "@/lib/history";
const modes = [
  ["food", "🍜", "今天吃什麼？", "肚子餓而已，怎麼會變這麼複雜。"],
  ["buy", "🛍️", "這個該不該買？", "在我又亂買之前，幫我想一下。"],
  ["tasks", "🔥", "先做哪一件？", "每件事都很急。應該沒有吧。"],
  ["compare", "⚖️", "幫我選一個", "選項有點多。是真的有點多。"],
] as const;
export default function DecisionBuddy() {
  const [mode, setMode] = useState<Mode>("home");
  const [history, setHistory] = useState<Entry[]>([]);
  useEffect(() => {
    setHistory(readHistory());
    const sync = (e: StorageEvent) => {
      if (e.key === KEY || e.key === null) setHistory(readHistory());
    };
    addEventListener("storage", sync);
    return () => removeEventListener("storage", sync);
  }, []);
  // 紀錄裡的 mode 是從 localStorage 讀回來的，型別標成 Mode 不代表它真的是——
  // 舊的一筆、改過名的一個模式、或手動編輯過的值都會進到這裡。認不得就回首頁，
  // 總比把人丟在空白畫面上好。
  const go = (m: Mode) => {
    setMode(isMode(m) ? m : "home");
    scrollTo(0, 0);
  };
  const save = (type: string, title: string, result: string, m: Mode) => {
    const next = [
      {
        id: newId(),
        type,
        title,
        result,
        date: new Date().toLocaleDateString(undefined, {
          month: "short",
          day: "numeric",
        }),
        mode: m,
      },
      ...readHistory(),
    ].slice(0, 20);
    setHistory(next);
    writeHistory(next);
  };
  // Record<Mode, …> 讓「新增一個模式卻忘了接畫面」變成編譯錯誤，而不是空白頁。
  const screens: Record<Mode, () => React.ReactNode> = {
    home: () => <Home go={go} />,
    random: () => <RandomMode save={save} />,
    buy: () => <BuyMode save={save} />,
    food: () => <FoodMode save={save} />,
    tasks: () => <TaskMode save={save} />,
    compare: () => <CompareMode save={save} />,
    history: () => (
      <History
        items={history}
        go={go}
        remove={(id) => {
          const n = readHistory().filter((x) => x.id !== id);
          setHistory(n);
          writeHistory(n);
        }}
      />
    ),
  };
  return (
    <>
      <header>
        <button className="brand" onClick={() => go("home")}>
          <Mascot /> <b>Decision Buddy</b>
        </button>
        <nav>
          <button onClick={() => go("home")}>首頁</button>
          <button onClick={() => go("history")}>
            紀錄 <sup>{history.length || ""}</sup>
          </button>
        </nav>
      </header>
      <main>{(screens[mode] ?? screens.home)()}</main>
      <footer>只處理小事。人生大事還是你自己的。</footer>
    </>
  );
}
function Home({ go }: { go: (m: Mode) => void }) {
  return (
    <section className="home">
      <div className="doodle d1">✦</div>
      <div className="doodle d2">♡</div>
      <div className="doodle d3">?</div>
      <div className="hero">
        <div className="heroBuddy">
          <Mascot />
          <span>嗨！</span>
        </div>
        <p className="eyebrow">你口袋裡的決定小幫手</p>
        <h1>還是決定不了？</h1>
        <p>沒關係，我就是為了這個存在的。</p>
      </div>
      <h2 className="sectiontitle">今天的難題是什麼？</h2>
      <div className="modegrid">
        {modes.map(([id, icon, title, sub], i) => (
          <button
            className={`modecard card${i + 1}`}
            key={id}
            onClick={() => go(id)}
          >
            <span className="cardicon" aria-hidden="true">
              {icon}
            </span>
            <div>
              <h2>{title}</h2>
              <p>{sub}</p>
            </div>
            <b>↗</b>
          </button>
        ))}
      </div>
      <button className="randomcard" onClick={() => go("random")}>
        <span aria-hidden="true">🎲</span>
        <div>
          <b>你幫我決定就好</b>
          <small>今天腦袋不想開機。</small>
        </div>
        <b>→</b>
      </button>
    </section>
  );
}
function Shell({
  tag,
  title,
  sub,
  children,
}: {
  tag: string;
  title: string;
  sub: string;
  children: React.ReactNode;
}) {
  return (
    <section className="flow">
      <div className="questionhead">
        <Mascot />
        <div>
          <p className="eyebrow">{tag}</p>
          <h1>{title}</h1>
          <p className="lede">{sub}</p>
        </div>
      </div>
      {children}
    </section>
  );
}
function OptionList({
  values,
  setValues,
  max = 10,
}: {
  values: string[];
  setValues: (v: string[]) => void;
  max?: number;
}) {
  return (
    <div className="optionlist">
      {values.map((v, i) => (
        <div className="optionrow" key={i}>
          <span>{i + 1}</span>
          <input
            aria-label={`選項 ${i + 1}`}
            placeholder="輸入一個選項…"
            value={v}
            onChange={(e) =>
              setValues(values.map((x, j) => (j === i ? e.target.value : x)))
            }
          />
          {values.length > 2 && (
            <button
              aria-label="移除選項"
              onClick={() => setValues(values.filter((_, j) => j !== i))}
            >
              ×
            </button>
          )}
        </div>
      ))}
      {values.length < max && (
        <button className="add" onClick={() => setValues([...values, ""])}>
          ＋ 再加一個
        </button>
      )}
    </div>
  );
}
function RandomMode({ save }: { save: Function }) {
  const [opts, setOpts] = useState(["牛肉麵", "火鍋", "壽司"]);
  const [winner, setWinner] = useState("");
  const [spinning, setSpinning] = useState(false);
  const [rejected, setRejected] = useState(false);
  // 其他三個流程都是 filter(x => x.trim())，只有這裡是 filter(Boolean)，
  // 所以只打了空白的選項會被當成有效、還可能被抽中，贏家就印成一片空白。
  const clean = opts.map((x) => x.trim()).filter(Boolean);
  // The spin runs on an interval that nothing owned, which cost two entries in the
  // history each time:
  //
  // A second click landed before the first tick swapped the screen 70ms later, so two
  // intervals ran and both saved — measured as a duplicate at every gap up to 60ms,
  // which is an ordinary double click and an ordinary double tap.
  //
  // And leaving mid-spin did not stop it: the interval kept running and saved a result
  // nobody stayed to see.
  //
  // A ref rather than the spinning state, because state does not update until the next
  // render and both clicks of a double click are handled before that.
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);
  const stop = () => {
    if (timer.current) clearInterval(timer.current);
    timer.current = null;
  };
  useEffect(() => stop, []);
  const pick = (list = clean) => {
    if (timer.current || list.length < 2) return;
    setRejected(false);
    setSpinning(true);
    let n = 0;
    timer.current = setInterval(() => {
      setWinner(list[Math.floor(Math.random() * list.length)]);
      if (++n > 10) {
        stop();
        const w = list[Math.floor(Math.random() * list.length)];
        setWinner(w);
        setSpinning(false);
        save("🎲", "隨手一抽", w, "random");
      }
    }, 70);
  };
  return (
    <Shell
      tag="隨便挑一個"
      title="好，在哪幾個之間猶豫？"
      sub="深奧的科學部分交給我。"
    >
      {!winner ? (
        <>
          <OptionList values={opts} setValues={setOpts} />
          <button
            className="primary"
            disabled={clean.length < 2}
            onClick={() => pick()}
          >
            🎲 決定我的命運
          </button>
        </>
      ) : (
        <div className={"result " + (spinning ? "spinning" : "")}>
          <div className="sparkles" aria-hidden="true">
            ✦ · ✧
          </div>
          <Mascot mood={spinning ? "think" : rejected ? "caught" : "happy"} />
          <p>
            {spinning ? "鴨子想一下…" : rejected ? "啊哈！" : "好了，解決。"}
          </p>
          <h2>{rejected ? "那就把它劃掉。" : winner + "！"}</h2>
          {!rejected && (
            <div className="actions">
              <button className="primary" onClick={() => setWinner("")}>
                好啦 😌
              </button>
              <button
                className="secondary"
                onClick={() => {
                  const n = clean.filter((x) => x !== winner);
                  setOpts(n);
                  setRejected(true);
                  setTimeout(() => {
                    setWinner("");
                    setTimeout(() => pick(n), 50);
                  }, 700);
                }}
              >
                絕對不要
              </button>
            </div>
          )}
        </div>
      )}
    </Shell>
  );
}
function BuyMode({ save }: { save: Function }) {
  return <BuyFlow save={save as any} />;
}
function FoodMode({ save }: { save: Function }) {
  return <FoodFlow save={save as any} />;
}
function TaskMode({ save }: { save: Function }) {
  return <TaskFlow save={save as any} />;
}
function CompareMode({ save }: { save: Function }) {
  return <CompareFlow save={save as any} />;
}
function History({
  items,
  remove,
  go,
}: {
  items: Entry[];
  remove: (id: string) => void;
  go: (m: Mode) => void;
}) {
  return (
    <Shell
      tag="存在這台裝置上"
      title="你最近的決定"
      sub="一個小小的檔案庫，裝著你不必再糾結的事。"
    >
      {items.length ? (
        <div className="history">
          {items.map((x) => (
            <article key={x.id}>
              <span>{x.type}</span>
              <div>
                <h2>{x.title}</h2>
                <p>{x.result}</p>
                <small>{x.date}</small>
              </div>
              <div>
                <button onClick={() => go(x.mode)}>再決定一次</button>
                <button onClick={() => remove(x.id)}>刪除</button>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="empty">
          <Mascot mood="sleep" />
          <h2>哇，果斷得有點可疑。</h2>
          <p>看來你都自己做決定了。厲害。</p>
          <button className="primary" onClick={() => go("home")}>
            給鴨子找點事做
          </button>
        </div>
      )}
    </Shell>
  );
}
