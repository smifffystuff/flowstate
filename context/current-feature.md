# Current Feature: Stage 09 – Dashboard Metrics & Summary Cards

## Status

In Progress

## Goals

- `GET /api/insights` returns computed metrics (totalCodingMinutes, flowSessionCount, avgFlowDurationMinutes, longestFlowMinutes, contextSwitchesTotal, avgContextSwitchesPerDay, activeDays, topRepos) for a given date window
- Dashboard page replaces placeholder with real layout: 4 metric cards, active days row, top repos table
- `MetricCard` component wraps ShadCN Card with label/value/subtext/trend props
- Date range selector (Tabs: This Week / Last 7 Days / Last 14 Days) triggers client-side re-fetch
- Skeleton loading states and empty state with "Sync Now" button render correctly
- All four metric cards show non-zero values after a sync

## Notes

- `GET /api/insights` defaults `from` to start of current week (Monday), `to` to now; returns 200 with zero values if no data
- `totalCodingMinutes` = sum of session `durationMinutes`; `contextSwitchesTotal` = sum of session `contextSwitches`; `topRepos` = top 5 repos by event count via aggregation
- Dashboard `page.tsx` is an async Server Component — fetches directly from MongoDB, passes data as props to client sub-components
- Date range tabs are a client component that re-fetches `GET /api/insights` with updated params
- Empty state shows "No activity yet. Sync your GitHub account to get started." with a Sync Now button calling `POST /api/github/sync`
- Keep layout clean and spacious — first impression after login

## History

- **Stage 01 – Project Setup**: Bootstrapped Next.js 16 app with App Router, TypeScript, Tailwind CSS v4, ShadCN UI (8 baseline components), Inter font, root layout with navbar, landing page with CTA, and `.env.local.example`. Build passes clean with no TypeScript errors.
- **Stage 02 – Authentication with Clerk**: Installed `@clerk/nextjs` and `@clerk/ui`. Added `ClerkProvider` with shadcn theme, Clerk proxy middleware protecting app routes, auth-aware navbar, GitHub OAuth sign-in page, protected app shell with sidebar nav, placeholder dashboard, and `lib/auth.ts` `getCurrentUser()` helper. No sign-up page — GitHub OAuth handles new users. Build passes clean.
- **Stage 03 – Database Setup**: Installed `mongoose`. Created `lib/db.ts` with serverless-safe cached `connectDB()`. Defined `User` (unique index on `clerkUserId`), `Event` (compound index `{ userId, timestamp }`, unique index `{ userId, githubId }`), and `Session` (index on `{ userId, start }`) Mongoose models with TypeScript interfaces. Re-exported all from `lib/models/index.ts`. Build passes clean.
- **Stage 04 – GitHub Connection & Token Storage**: Implemented GitHub OAuth 2.0 flow via `app/api/github/connect` and `app/api/github/callback` with CSRF state cookie. Added `lib/crypto.ts` (AES-256-GCM encrypt/decrypt using Node's built-in `crypto`), `lib/users.ts` (`getOrCreateUser`, `setGithubToken`), and `app/(app)/settings/page.tsx` showing connection status. Token stored encrypted in MongoDB User document. Build passes clean.
- **Stage 05 – GitHub Event Sync**: Added `lib/github.ts` (thin `fetch` wrapper — `getUserRepos`, `getCommits`, `getPullRequests` with rate-limit and 401/403 error handling), `lib/events.ts` (`normaliseCommit`, `normalisePR` mapping raw GitHub data to `EventDocument`), and `POST /api/github/sync` route. Sync fetches up to 50 repos × 100 commits + 50 PRs, bulk-upserts with deduplication via unique index on `{ userId, githubId }`, and updates `User.lastSyncAt`. Per-repo errors are logged but non-fatal. `User` model extended with `lastSyncAt`. Build passes clean.
- **Stage 06 – Events API**: Added `GET /api/events` with `from`/`to`/`repo`/`type`/`limit`/`offset` query params, date validation (400), type enum validation (`commit`, `pr_open`, `pr_update`, `pr_review`), limit clamped to 500, sorted by `timestamp` desc, returns `{ events, total, hasMore }`. Added `GET /api/events/repos` returning distinct sorted repo names for the user. Both routes return 401 for unauthenticated requests. Build passes clean.
- **Stage 07 – Flow Session Detection Engine**: Added `lib/sessions.ts` with `detectSessions()` gap-heuristic algorithm (`SESSION_GAP_MINUTES = 10`), computing `start`, `end`, `durationMinutes`, `eventIds`, `repos`, `repoCount`, and `contextSwitches` per session; discards sessions with <2 events or <1 min duration. Added `POST /api/sessions/compute` (idempotent delete-then-insert for a time window) and `GET /api/sessions` (sorted descending by `start`, `from`/`to` params with date validation). Updated `POST /api/github/sync` to recompute sessions automatically after inserting events. Build passes clean.
- **Stage 08 – Activity Timeline UI**: Added `app/(app)/timeline/page.tsx` (async Server Component fetching last 7 days of events + distinct repos directly from MongoDB), `components/timeline/Timeline.tsx` (client component grouping events by local calendar day, re-fetches on date range change, client-side repo/type filtering, skeleton loading + empty states), `components/timeline/EventItem.tsx` (type icon, relative + absolute time via `Intl.DateTimeFormat`, repo Badge, truncated message/title), `components/timeline/FilterBar.tsx` (date range inputs, repo Select, type Select using ShadCN primitives). Sidebar Timeline link was already present. Build passes clean.
