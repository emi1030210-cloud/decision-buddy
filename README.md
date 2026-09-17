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

Next.js App Router, React, and TypeScript. Tailwind is installed, but the UI is hand-written CSS: `app/globals.css` for the shell, CSS Modules for the flows.

`components/DecisionBuddy.tsx` is the shell — header, home screen, random picker and history — and hands each guided mode to its own component:

| Mode | Component | Styles |
| --- | --- | --- |
| 🛍️ Should I Buy It? | `BuyFlow.tsx` | `BuyFlow.module.css` |
| 🍜 What Should I Eat? | `FoodFlow.tsx` | `FoodFlow.module.css` |
| 🔥 What Should I Do First? | `TaskFlow.tsx` | `Flow.module.css` |
| ⚖️ Help Me Choose | `CompareFlow.tsx` | `Flow.module.css` |

All four share the `DuckBuddy` mascot exported from `BuyFlow.tsx` and ask one screenful of tap targets at a time — no sliders or dropdowns.

`lib/decisions.ts` holds the pure scoring functions — `rankTasks`, `compare`, `scoreBuy` and `scoreFood` — one per mode. The components own the questions, the copy and the duck's reactions; the arithmetic lives in the library.

The app is client-side and requires no authentication or backend.

History is stored under the browser `localStorage` key `buddy-history` as an array of `{ id, type, title, result, date, mode }` objects. It stays on the device and can be deleted item by item.

## Run locally

```bash
npm install
npm run dev
```

Open `http://localhost:3000`. Use `npm run build` to create a production build.

## Deploy

Import the repository into Vercel and accept the detected Next.js defaults. No environment variables, database, or paid services are required.
