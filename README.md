# Decision Buddy

Decision Buddy is a quick, friendly web app for the low- to medium-stakes decisions that somehow consume an unreasonable amount of time.

## Problem

People waste surprising amounts of time making everyday decisions, especially when several reasonable options exist.

## Solution

Decision Buddy provides lightweight decision frameworks that are faster and friendlier than spreadsheets or traditional decision matrices. It includes four guided modes—🍜 What Should I Eat?, 🛍️ Should I Buy It?, 🔥 What Should I Do First?, and ⚖️ Help Me Choose—plus a zero-analysis random picker.

> **Decision Buddy doesn't make important life decisions for you. It helps make your own preferences visible.**

## Decision logic

- **Food:** you pick up to two priorities and name the winner of each. A priority awards its points to the option that won it — 2 for budget, health or convenience, 3 for craving — and the gut check adds 3 more. Highest total wins; a tie goes to the craving pick, then to the gut pick, then to a coin flip.
- **Purchase:** every answer carries its own point value, positive or negative — owning a working duplicate or buying on impulse costs points, genuine need and long-held desire earn them. The total decides: 40 or more is Buy It, 5 or more is Wait A Little, below that is Maybe Don't.
- **Tasks:** combines deadline urgency, importance, whether a task fits the available time, and energy cost.
- **Comparison:** computes `Σ(rating × importance)` and normalizes against the maximum possible score.
- **Random:** selects uniformly from the remaining non-empty options.

Every result exposes its reasoning or scoring inputs. All of it lives in `lib/decisions.ts` and is deterministic — the two places a coin is flipped, the random picker and the food tie-break, do the flipping in the component — and none of it calls an AI API.

## Architecture

Next.js App Router, React, and TypeScript. The UI is hand-written CSS: `app/globals.css` for the shell, CSS Modules for the flows.

Tailwind used to be a dependency, purely for its preflight reset — not one utility class was ever used. It brought seven advisories in through its own build-time dependencies, so the compiled preflight now sits at the top of `app/globals.css` and the package is gone. Rendering is unchanged; it is the same CSS, just no longer generated. Note the heading rule in there: preflight resets `h1`–`h6` to `font-weight: inherit`, which is why the heading weight has to be set explicitly a few lines further down.

The interface is in Traditional Chinese (zh-Hant-TW).

Two rounded typefaces, both self-hosted, loaded differently. Baloo 2 comes through `next/font/google` in `app/layout.tsx` and reaches CSS as `--font-rounded`. jf open 粉圓 is declared by hand in `app/huninn.css` instead, because the chunking below needs thirteen `@font-face` rules sharing one family name, each with its own `unicode-range`, and it is referenced by that family name rather than a variable. The stack in `app/globals.css` is `var(--font-rounded), "huninn", …` — Latin resolves in the first, Chinese falls through to the second. Baloo 2 carries no CJK, so without the second face Chinese would fall back to the system font and lose the rounded look the whole design rests on. No rounded Traditional Chinese face on Google Fonts is usable here — the Japanese rounded families set punctuation and several glyphs to Japanese conventions, and LXGW WenKai TC renders 為 as the 爲 variant.

The Chinese face is split into `unicode-range` chunks under `public/fonts/`, the way Google Fonts serves CJK, and declared in `app/huninn.css`. Chunk 0 holds Latin, punctuation, every character in the app's own copy and a list of everyday Chinese — about 365 KB, and the only one a normal page fetches. The remaining twelve cover the rest of the font and download lazily, so a character outside it — say the 甕 of 甕仔雞 — pulls just the chunk holding it.

Splitting purely by codepoint does not work here: common characters end up scattered across every chunk, so one Chinese page pulls all of them. That is why chunk 0 is built from the UI's own text plus `scripts/common-zh.txt`.

What counts as "the UI's own text" is decided in one place, `scripts/ui-text.mjs`, because two things need the same answer and must agree: the build script, and `lib/font-coverage.test.ts`, which checks nothing rendered falls outside chunk 0. It scans `components/`, `app/` and `lib/` and strips comments and regex literals — a Chinese code comment is never painted, and a Chinese character in a regex is matched against what someone types.

`scripts/common-zh.txt` carries a general frequency list plus food vocabulary. The
second half is there because the only free text most people type into this app is a dish
name, and a general list does not cover those: before it was added, typing 豆腐 pulled
359 KB of extra chunks onto a page whose entire first load was 337 KB, while the
placeholder 牛肉麵 pulled nothing — which is why it went unnoticed. Adding the vocabulary
put 28 KB on chunk 0 and took every one of 84 common dish names down to nothing extra —
豆腐, 水餃, 珍珠奶茶, 蚵仔煎, 小籠包, 佛跳牆. The second pass came from checking dish names
rather than ingredients: half-covered words were the giveaway, 蘿 being present and 蔔
absent, so 蘿蔔糕 still cost a chunk.
Comments in that file must stay ASCII: the build counts every character in it.

Each chunk's filename carries a hash of its own bytes (`huninn-0.cd36d077.woff2`), which
is what lets `next.config.mjs` serve them `immutable` for a year. Next does this for its
own build output but serves everything in `public/` as `max-age=0, must-revalidate`, so
before the hash the font cost a CDN round trip on every single page load — about 40 ms
from a fast connection, and with `font-display: swap` that is a flash of the fallback
face each time. The rule only matches hashed names: a stable name cached for a year
would strand anyone on an old font the next time it is rebuilt.

Regenerate after adding copy, or to change the font:

```bash
node scripts/build-font.mjs path/to/jf-openhuninn-2.1.ttf
```

`components/DecisionBuddy.tsx` is the shell — header, home screen, random picker and history — and hands each guided mode to its own component:

| Mode | Component | Styles |
| --- | --- | --- |
| 🛍️ Should I Buy It? | `BuyFlow.tsx` | `BuyFlow.module.css` |
| 🍜 What Should I Eat? | `FoodFlow.tsx` | `FoodFlow.module.css` |
| 🔥 What Should I Do First? | `TaskFlow.tsx` | `Flow.module.css` |
| ⚖️ Help Me Choose | `CompareFlow.tsx` | `Flow.module.css` |

All four share the `DuckBuddy` mascot exported from `BuyFlow.tsx` and ask one screenful of tap targets at a time — no sliders or dropdowns.

`lib/buy-questions.ts` holds the purchase questions and their reason copy, kept out of the component so the tests can check that the two stay in step — `reasonCopy` is keyed by answer label, and a drift there empties the verdict screen's reason list with no error.

`lib/decisions.ts` holds the pure scoring functions — `rankTasks`, `compare`, `scoreBuy` and `scoreFood` — one per mode. The components own the questions, the copy and the duck's reactions; the arithmetic lives in the library.

The app is client-side and requires no authentication or backend.

The browser tab icon is `app/icon.svg`. There is no social share image yet: drop a 1200x630 `app/opengraph-image.png` into `app/` (and the same file as `app/twitter-image.png`) and Next will serve it and emit the `og:image` tags automatically. Set `NEXT_PUBLIC_SITE_URL` if you want those URLs pinned to a custom domain rather than Vercel's.

History is stored under the browser `localStorage` key `buddy-history` as an array of `{ id, type, title, result, date, mode }` objects. It stays on the device and can be deleted item by item.

## Run locally

```bash
npm install
npm run dev
```

Open `http://localhost:3000`. Use `npm run build` to create a production build.

```bash
npm test
```

runs five files on `node:test` with Node's own TypeScript stripping, so there is
nothing to install:

| File | What it pins down |
| --- | --- |
| `decisions.test.ts` | the thresholds, the tie-break order, the weighting that makes a deadline outrank importance |
| `buy-questions.test.ts` | every answer has reason copy and vice versa, and the two labels the flow compares by string still exist |
| `duck-states.test.ts` | every `DuckState` has a CSS class, and no class is left pointing at a state that was renamed |
| `font-coverage.test.ts` | nothing the app renders falls outside font chunk 0, or outside the font |
| `history.test.ts` | nothing unreadable in `localStorage` reaches React, and `newId` still works without `crypto.randomUUID` |

The last four exist because each guards something that fails quietly or not at all: a
missing reason empties the verdict list, a missing class leaves the duck expressionless,
a character outside chunk 0 just costs an extra download, and an unreadable history
entry takes the whole app down to a blank error page.

`lib/history.ts` holds the `localStorage` layer for the same reason `lib/buy-questions.ts`
holds the purchase questions: a component imports a CSS Module, which `node:test` cannot
parse, so anything left in one cannot be tested.

Stop the dev server before `npm run build`: the production output overwrites `.next`
and leaves the running dev server unable to find its own chunks, which surfaces as
`Cannot find module './833.js'` a long way from its cause. A `prebuild` step checks the
port and refuses rather than letting that happen; it skips itself on CI and on Vercel,
and fails open, so a bug in the check can never block a deploy. Point it elsewhere with
`PORT=4000 npm run build` if the dev server is on another port.

## Deploy

Import the repository into Vercel and accept the detected Next.js defaults. No environment variables, database, or paid services are required.

## License

MIT — see [LICENSE](LICENSE).

The bundled typeface jf open 粉圓 is licensed separately under the SIL Open Font License 1.1; see [`public/fonts/OFL.txt`](public/fonts/OFL.txt).
