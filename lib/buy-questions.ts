// The question tables for 🛍️ Should I Buy It?, kept apart from the component so the
// invariants between them can be tested — reasonCopy is keyed by the answer labels, and
// nothing complains at runtime when the two drift apart. Translating the labels once
// emptied the reason list on the verdict screen with no error at all.

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
export type Choice = {
  label: string;
  sub: string;
  icon?: string;
  value: number;
  reaction: string;
  duck: DuckState;
};
export type Key =
  "owns" | "condition" | "wanted" | "usage" | "budget" | "reason";
export const questions: Record<
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
export const reasonCopy: Record<
  string,
  Record<string, [string, string, string]>
> = {
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
