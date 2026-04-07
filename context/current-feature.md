# Current Feature: Stage 05 – GitHub Event Sync

## Status

In Progress

## Goals

- `lib/github.ts` implements `getUserRepos`, `getCommits`, `getPullRequests` using `fetch` with Bearer auth and rate limit awareness
- `lib/events.ts` implements `normaliseCommit` and `normalisePR` mapping raw GitHub data to `EventDocument`
- `POST /api/github/sync` authenticates via Clerk, decrypts token, syncs last 14 days (or since `lastSyncAt`), returns `{ inserted, skipped, repos }`
- Duplicate events are silently skipped via unique index on `{ userId, githubId }` — running sync twice produces no duplicates
- GitHub 401 marks `githubConnected: false` and returns 401; GitHub 403 returns 429 with retry hint
- Per-repo failures are logged but do not abort the full sync

## Notes

- No Octokit — use `fetch` directly
- Limit: 100 commits and 50 PRs per repo (no deep pagination for MVP)
- Filter commits by authenticated user (`author` param on GitHub API)
- Up to 50 repos (owned + member, sorted by last updated)
- `normaliseCommit`: type `commit`, githubId = SHA, timestamp = author date, metadata.message = first line
- `normalisePR`: type `pr_open` if created_at is recent else `pr_update`, githubId = node_id + event type, metadata includes prNumber, prTitle, url
- Sync runs synchronously within the request (no background jobs for MVP)
- No new env vars required

## History

- **Stage 01 – Project Setup**: Bootstrapped Next.js 16 app with App Router, TypeScript, Tailwind CSS v4, ShadCN UI (8 baseline components), Inter font, root layout with navbar, landing page with CTA, and `.env.local.example`. Build passes clean with no TypeScript errors.
- **Stage 02 – Authentication with Clerk**: Installed `@clerk/nextjs` and `@clerk/ui`. Added `ClerkProvider` with shadcn theme, Clerk proxy middleware protecting app routes, auth-aware navbar, GitHub OAuth sign-in page, protected app shell with sidebar nav, placeholder dashboard, and `lib/auth.ts` `getCurrentUser()` helper. No sign-up page — GitHub OAuth handles new users. Build passes clean.
- **Stage 03 – Database Setup**: Installed `mongoose`. Created `lib/db.ts` with serverless-safe cached `connectDB()`. Defined `User` (unique index on `clerkUserId`), `Event` (compound index `{ userId, timestamp }`, unique index `{ userId, githubId }`), and `Session` (index on `{ userId, start }`) Mongoose models with TypeScript interfaces. Re-exported all from `lib/models/index.ts`. Build passes clean.
- **Stage 04 – GitHub Connection & Token Storage**: Implemented GitHub OAuth 2.0 flow via `app/api/github/connect` and `app/api/github/callback` with CSRF state cookie. Added `lib/crypto.ts` (AES-256-GCM encrypt/decrypt using Node's built-in `crypto`), `lib/users.ts` (`getOrCreateUser`, `setGithubToken`), and `app/(app)/settings/page.tsx` showing connection status. Token stored encrypted in MongoDB User document. Build passes clean.
