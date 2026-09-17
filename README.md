# Decision Buddy

Decision Buddy is a quick, friendly web app for the low- to medium-stakes decisions that somehow consume an unreasonable amount of time.

## Problem

People waste surprising amounts of time making everyday decisions, especially when several reasonable options exist.

## Solution

Decision Buddy provides lightweight decision frameworks that are faster and friendlier than spreadsheets or traditional decision matrices. It includes four guided modes—🍜 What Should I Eat?, 🛍️ Should I Buy It?, 🔥 What Should I Do First?, and ⚖️ Help Me Choose—plus a zero-analysis random picker.

> **Decision Buddy doesn't make important life decisions for you. It helps make your own preferences visible.**

## Decision logic

- **Food:** normalizes the weighted sum of budget fit, health, convenience, and craving to 100.
- **Purchase:** adds points for need, long-held desire, frequent use, and failed alternatives; working duplicates, impulse timing, and budget pain reduce the score. Scores produce Buy, Wait 7 Days, or Maybe Don't.
- **Tasks:** combines deadline urgency, importance, whether a task fits the available time, and energy cost.
- **Comparison:** computes `Σ(rating × importance)` and normalizes against the maximum possible score.
- **Random:** selects uniformly from the remaining non-empty options.

Every result exposes its reasoning or scoring inputs. The engine is deterministic except for the intentionally random picker and uses no AI API.

## Architecture

Next.js App Router, React, TypeScript, and Tailwind CSS. `components/DecisionBuddy.tsx` contains the progressive flows and reusable form controls; `lib/decisions.ts` holds pure scoring functions. The app is client-side and requires no authentication or backend.

History is stored under the browser `localStorage` key `buddy-history` as an array of `{ id, type, title, result, date, mode }` objects. It stays on the device and can be deleted item by item.

## Run locally

```bash
npm install
npm run dev
```

Open `http://localhost:3000`. Use `npm run build` to create a production build.

## Deploy

Import the repository into Vercel and accept the detected Next.js defaults. No environment variables, database, or paid services are required.
