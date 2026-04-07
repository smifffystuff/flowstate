# Current Feature

## Status

Not Started

## Goals

<!-- bullet points of what success looks like -->

## Notes

<!-- additional context, constraints, or details -->

## History

- **Stage 01 – Project Setup**: Bootstrapped Next.js 16 app with App Router, TypeScript, Tailwind CSS v4, ShadCN UI (8 baseline components), Inter font, root layout with navbar, landing page with CTA, and `.env.local.example`. Build passes clean with no TypeScript errors.
- **Stage 02 – Authentication with Clerk**: Installed `@clerk/nextjs` and `@clerk/ui`. Added `ClerkProvider` with shadcn theme, Clerk proxy middleware protecting app routes, auth-aware navbar, GitHub OAuth sign-in page, protected app shell with sidebar nav, placeholder dashboard, and `lib/auth.ts` `getCurrentUser()` helper. No sign-up page — GitHub OAuth handles new users. Build passes clean.
- **Stage 03 – Database Setup**: Installed `mongoose`. Created `lib/db.ts` with serverless-safe cached `connectDB()`. Defined `User` (unique index on `clerkUserId`), `Event` (compound index `{ userId, timestamp }`, unique index `{ userId, githubId }`), and `Session` (index on `{ userId, start }`) Mongoose models with TypeScript interfaces. Re-exported all from `lib/models/index.ts`. Build passes clean.
- **Stage 04 – GitHub Connection & Token Storage**: Implemented GitHub OAuth 2.0 flow via `app/api/github/connect` and `app/api/github/callback` with CSRF state cookie. Added `lib/crypto.ts` (AES-256-GCM encrypt/decrypt using Node's built-in `crypto`), `lib/users.ts` (`getOrCreateUser`, `setGithubToken`), and `app/(app)/settings/page.tsx` showing connection status. Token stored encrypted in MongoDB User document. Build passes clean.
- **Stage 05 – GitHub Event Sync**: Added `lib/github.ts` (thin `fetch` wrapper — `getUserRepos`, `getCommits`, `getPullRequests` with rate-limit and 401/403 error handling), `lib/events.ts` (`normaliseCommit`, `normalisePR` mapping raw GitHub data to `EventDocument`), and `POST /api/github/sync` route. Sync fetches up to 50 repos × 100 commits + 50 PRs, bulk-upserts with deduplication via unique index on `{ userId, githubId }`, and updates `User.lastSyncAt`. Per-repo errors are logged but non-fatal. `User` model extended with `lastSyncAt`. Build passes clean.
- **Stage 06 – Events API**: Added `GET /api/events` with `from`/`to`/`repo`/`type`/`limit`/`offset` query params, date validation (400), type enum validation (`commit`, `pr_open`, `pr_update`, `pr_review`), limit clamped to 500, sorted by `timestamp` desc, returns `{ events, total, hasMore }`. Added `GET /api/events/repos` returning distinct sorted repo names for the user. Both routes return 401 for unauthenticated requests. Build passes clean.
