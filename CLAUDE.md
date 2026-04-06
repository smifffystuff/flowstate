# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Status

This repository is **pre-implementation**. The full product specification lives in `context/spec/flowstate-spec.md` and the 15 step-by-step feature stages live in `context/features/`. Read the relevant stage file before starting any implementation work. Stages must be built in order as each depends on the previous.

## What We Are Building

FlowState is a Next.js developer productivity app that connects to GitHub, ingests commit and PR events, detects "flow sessions" (periods of uninterrupted work), and surfaces insights on a dashboard. No manual input — value is immediate after GitHub is connected.

## Tech Stack

| Concern | Choice |
|---------|--------|
| Framework | Next.js App Router (TypeScript) |
| Styling | Tailwind CSS + ShadCN UI |
| Auth | Clerk (GitHub + Google OAuth) |
| Database | MongoDB Atlas via Mongoose |
| Deployment | Vercel |
| Unit/API tests | Vitest + `mongodb-memory-server` |
| E2E tests | Playwright |

## Commands

Once the app is scaffolded these will be the standard commands:

```bash
npm run dev          # start development server
npm run build        # production build
npm run lint         # ESLint
npm test             # Vitest (unit + API integration)
npm run test:watch   # Vitest in watch mode
npm run test:coverage  # coverage report (target ≥ 80% on lib/ and API routes)
npm run test:e2e     # Playwright E2E (starts Next.js dev server automatically)
npm run test:e2e:ui  # Playwright with interactive UI
```

Run a single Vitest test file:
```bash
npx vitest run tests/lib/sessions.test.ts
```

Run a single Playwright spec:
```bash
npx playwright test tests/e2e/dashboard.spec.ts
```

## Repository Layout (planned)

```
app/
  (auth)/               # Sign-in / sign-up pages (Clerk components)
  (app)/                # Protected route group
    dashboard/          # Main dashboard — metrics, charts, insights
    timeline/           # Chronological event list
    settings/           # GitHub connection management
  api/
    github/
      connect/          # GET  — initiates GitHub OAuth
      callback/         # GET  — OAuth code exchange, stores encrypted token
      sync/             # POST — fetches GitHub events, recomputes sessions
    events/             # GET  — paginated event list; /repos sub-route
    sessions/
      route.ts          # GET  — session list
      compute/          # POST — (re)compute sessions from events
    insights/           # GET  — aggregated metrics + insight messages
    sync/status/        # GET  — current sync state
components/
  ui/                   # ShadCN generated components — do not hand-edit
  dashboard/            # MetricCard, ActivityBarChart, SessionTimeline, etc.
  timeline/             # Timeline, EventItem, FilterBar
lib/
  db.ts                 # connectDB() with serverless-safe connection caching
  crypto.ts             # AES-256-GCM encrypt/decrypt for GitHub tokens
  github.ts             # Thin fetch wrapper for GitHub REST API
  events.ts             # Normalise raw GitHub data → Event documents
  sessions.ts           # Flow session detection algorithm
  insights.ts           # Rules-based insight message generator
  users.ts              # getOrCreateUser, setGithubToken helpers
  auth.ts               # getCurrentUser() thin wrapper around Clerk auth()
  models/
    User.ts / Event.ts / Session.ts / index.ts
tests/
  setup.ts              # mongodb-memory-server lifecycle + connectDB
  api/                  # API route integration tests (real DB, mocked GitHub API)
  lib/                  # Unit tests for sessions.ts, crypto.ts, etc.
  e2e/                  # Playwright specs
```

## Architecture Decisions

**Rendering:** every `page.tsx` is an async Server Component that fetches data directly (MongoDB or internal helper — not via `fetch('/api/...')`). Client components (`'use client'`) are added only at the leaf level where interactivity or browser APIs are needed.

**Auth identity:** Clerk's `userId` is the primary key used across MongoDB documents (`userId` field on Event and Session, `clerkUserId` on User). Never use MongoDB `_id` as a user identifier across collections.

**GitHub tokens:** stored AES-256-GCM encrypted in the `User` document. The raw token must never be logged. `lib/crypto.ts` handles all encrypt/decrypt using `TOKEN_ENCRYPTION_KEY` (64-char hex, 32 bytes). The GitHub OAuth App is separate from Clerk's — this is intentional to obtain `repo` scope tokens that Clerk does not expose.

**Session detection:** `lib/sessions.ts` contains the core algorithm. A gap of > `SESSION_GAP_MINUTES` (10) between consecutive events starts a new session. Sessions with fewer than 2 events or < 1 minute duration are discarded. Sessions are recomputed (delete-then-insert for the time window) after every sync — idempotent by design.

**Event deduplication:** the `Event` collection has a unique index on `{ userId, githubId }`. Sync uses `insertMany` with `ordered: false` so duplicate key errors are swallowed, not thrown.

**ShadCN components** live in `components/ui/` and are generated by the CLI (`npx shadcn@latest add <component>`). Do not hand-edit them — create wrapper components instead.

## Git Branching

Use `git switch` for all branch operations:
```bash
git switch -c feature/my-feature   # create and switch
git switch main                    # switch to existing branch
```
Never use `git checkout` for branch operations.

## Environment Variables

All required variables (see `.env.local.example` once scaffolded):

```
# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
CLERK_SECRET_KEY
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard

# MongoDB
MONGODB_URI

# GitHub OAuth (separate app from Clerk)
GITHUB_CLIENT_ID
GITHUB_CLIENT_SECRET
GITHUB_REDIRECT_URI=http://localhost:3000/api/github/callback

# Token encryption — generate with: openssl rand -hex 32
TOKEN_ENCRYPTION_KEY
```

## IMPORTANT

Do NOT add any co-authored by or similar to any commits that are made

## Testing Approach

- **API integration tests** use `mongodb-memory-server` — a real in-process MongoDB, no mocking of the DB layer. The GitHub REST API *is* mocked via `vi.mock('../../../lib/github')`.
- **E2E tests** use Clerk test mode credentials. Do not use real accounts.
- Tests are isolated: `afterEach` drops all collections.
- Each test file covers one API route or one UI flow. No omnibus files.
