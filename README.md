# Personal OS

A personal, all-in-one iOS app (React Native + Expo) from the Personal OS PRD.
All six screens are implemented (Today, Tasks, Journal, Habits, Gym, Finance)
and the Phase-1 backbone is real: Tasks, Habits (per-day logs), Journal, Finance
and the Quick-Capture Inbox all **persist to SQLite** via Zustand stores. Quick
Capture → Inbox → triage (into Task/Journal/Habit) works end-to-end, and the
**Today** screen aggregates live data from every module to compute the daily
score. (Gym is still a session-only view.)

## Tech stack

| Concern     | Choice                                  |
| ----------- | --------------------------------------- |
| Framework   | React Native + Expo (Dev Client), SDK 54 |
| Language    | TypeScript (strict)                     |
| Navigation  | Expo Router (file-based, typed routes)  |
| Local DB    | SQLite via `expo-sqlite`                |
| State       | Zustand                                 |
| Charts      | `react-native-svg` (donut)              |
| Fonts       | IBM Plex Sans / IBM Plex Mono           |
| Icons       | MaterialCommunityIcons (`@expo/vector-icons`) |

## Design source

The UI is a 1:1 implementation of the Claude Design project
`1114d4bb-6857-465a-8ae9-4124d2af582d`, screen **`06 Finance.dc.html`**
(imported reference kept in [`design/`](./design)).

## Getting started

```bash
npm install
npx expo start            # then press "i" for iOS simulator, or scan with a Dev Client
```

> Per the PRD, deployment is via an Expo Dev Client (cable Mac → iPhone); no App
> Store needed. Run `npx expo run:ios` for a native dev build.

## Project structure

```
app/
  _layout.tsx              # fonts + store init + splash + root Stack
  (tabs)/
    _layout.tsx            # bottom tab bar + hidden journal/habits routes
    index.tsx              # → TodayScreen
    tasks.tsx              # → TasksScreen
    health.tsx             # → GymScreen (immersive workout; tab bar hidden)
    finance.tsx            # → FinanceScreen
    more.tsx               # hub → Journal / Habits
    journal.tsx            # → JournalScreen   (hidden route)
    habits.tsx             # → HabitsScreen    (hidden route)
src/
  theme/                   # colors, typography, icon mapping (shared tokens)
  types/finance.ts         # domain model + Zustand store contract
  utils/                   # currency (VND) + date/month helpers
  db/  data/seed.ts        # SQLite schema/helpers + Finance first-run data
  store/                   # one Zustand store per module
  features/                # today / tasks / journal / habits / gym / finance
design/                    # imported Claude Design reference
```

### Navigation map

| Tab        | Screen                          | Design          |
| ---------- | ------------------------------- | --------------- |
| Today      | `index` → TodayScreen           | 01 Today        |
| Tasks      | `tasks` → TasksScreen           | 02 Tasks        |
| Health     | `health` → GymScreen (immersive)| 05 Gym Tracker  |
| Finance    | `finance` → FinanceScreen       | 06 Finance      |
| More       | hub → Journal / Habits          | —               |
| _(hidden)_ | `journal`, `habits`             | 03 / 04         |

## Finance module (PRD §3.2)

Implemented: quick transactions, custom categories, monthly budget with usage
bar, monthly overview (income / spent / saved), and category breakdown donut.
Data persists to SQLite and is multi-user-ready (every row carries an optional
`userId`). Recurring transactions and CSV export are modeled in the schema for a
follow-up.
