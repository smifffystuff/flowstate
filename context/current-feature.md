# Current Feature: Stage 08 – Activity Timeline UI

## Status

In Progress

## Goals

- Timeline page shows events grouped by day, most recent first
- Each event shows correct icon, time, repo badge, and message/title
- Repo and type filters narrow the displayed events
- Date range change re-fetches events for the new window
- Loading and empty states render correctly
- Page is responsive (readable on mobile)

## Notes

- Async Server Component page fetches initial events (last 7 days) directly from MongoDB and passes as props to client component
- `Timeline.tsx` (client) groups events by calendar day in user's local timezone; re-fetches only on filter/date range change
- `EventItem.tsx` renders icon (commit/pr_open/pr_update/pr_review), relative + absolute time, repo `Badge` (secondary), truncated message/title (80 chars)
- `FilterBar.tsx` uses ShadCN `Input` (date range), `Select` (repo from `/api/events/repos`), `Select` (event type); filters applied client-side — no re-fetch per filter change for MVP
- Loading state: ShadCN `Skeleton` rows (3 placeholders per day)
- Empty state (connected): "No activity found — try syncing your GitHub account"
- Empty state (not connected): "Connect your GitHub account to see your activity" with link to `/settings`
- Use `Intl.DateTimeFormat` for formatting — no date library
- Limit 200 events per fetch; no infinite scroll for MVP
- Add "Timeline" link to the app sidebar/nav

## History

- **Stage 01 – Project Setup**: Bootstrapped Next.js 16 app with App Router, TypeScript, Tailwind CSS v4, ShadCN UI (8 baseline components), Inter font, root layout with navbar, landing page with CTA, and `.env.local.example`. Build passes clean with no TypeScript errors.
- **Stage 02 – Authentication with Clerk**: Installed `@clerk/nextjs` and `@clerk/ui`. Added `ClerkProvider` with shadcn theme, Clerk proxy middleware protecting app routes, auth-aware navbar, GitHub OAuth sign-in page, protected app shell with sidebar nav, placeholder dashboard, and `lib/auth.ts` `getCurrentUser()` helper. No sign-up page — GitHub OAuth handles new users. Build passes clean.
- **Stage 03 – Database Setup**: Installed `mongoose`. Created `lib/db.ts` with serverless-safe cached `connectDB()`. Defined `User` (unique index on `clerkUserId`), `Event` (compound index `{ userId, timestamp }`, unique index `{ userId, githubId }`), and `Session` (index on `{ userId, start }`) Mongoose models with TypeScript interfaces. Re-exported all from `lib/models/index.ts`. Build passes clean.
- **Stage 04 – GitHub Connection & Token Storage**: Implemented GitHub OAuth 2.0 flow via `app/api/github/connect` and `app/api/github/callback` with CSRF state cookie. Added `lib/crypto.ts` (AES-256-GCM encrypt/decrypt using Node's built-in `crypto`), `lib/users.ts` (`getOrCreateUser`, `setGithubToken`), and `app/(app)/settings/page.tsx` showing connection status. Token stored encrypted in MongoDB User document. Build passes clean.
- **Stage 05 – GitHub Event Sync**: Added `lib/github.ts` (thin `fetch` wrapper — `getUserRepos`, `getCommits`, `getPullRequests` with rate-limit and 401/403 error handling), `lib/events.ts` (`normaliseCommit`, `normalisePR` mapping raw GitHub data to `EventDocument`), and `POST /api/github/sync` route. Sync fetches up to 50 repos × 100 commits + 50 PRs, bulk-upserts with deduplication via unique index on `{ userId, githubId }`, and updates `User.lastSyncAt`. Per-repo errors are logged but non-fatal. `User` model extended with `lastSyncAt`. Build passes clean.
- **Stage 06 – Events API**: Added `GET /api/events` with `from`/`to`/`repo`/`type`/`limit`/`offset` query params, date validation (400), type enum validation (`commit`, `pr_open`, `pr_update`, `pr_review`), limit clamped to 500, sorted by `timestamp` desc, returns `{ events, total, hasMore }`. Added `GET /api/events/repos` returning distinct sorted repo names for the user. Both routes return 401 for unauthenticated requests. Build passes clean.
- **Stage 07 – Flow Session Detection Engine**: Added `lib/sessions.ts` with `detectSessions()` gap-heuristic algorithm (`SESSION_GAP_MINUTES = 10`), computing `start`, `end`, `durationMinutes`, `eventIds`, `repos`, `repoCount`, and `contextSwitches` per session; discards sessions with <2 events or <1 min duration. Added `POST /api/sessions/compute` (idempotent delete-then-insert for a time window) and `GET /api/sessions` (sorted descending by `start`, `from`/`to` params with date validation). Updated `POST /api/github/sync` to recompute sessions automatically after inserting events. Build passes clean.
