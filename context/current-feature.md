# Current Feature: Stage 03 – Database Setup (MongoDB Atlas)

## Status

In Progress

## Goals

- Install `mongoose` and create `lib/db.ts` with a cached `connectDB()` function
- Create `lib/models/User.ts` with clerkUserId unique index
- Create `lib/models/Event.ts` with compound index on `{ userId, timestamp }` and unique index on `{ userId, githubId }`
- Create `lib/models/Session.ts` with index on `{ userId, start }`
- Create `lib/models/index.ts` re-exporting all three models
- `npm run build` passes clean with no TypeScript errors

## Notes

- `MONGODB_URI` must be set in `.env.local` (Atlas connection string)
- GitHub token encryption is deferred to Stage 04 — store `githubAccessToken` as plaintext with a TODO comment
- No data is written to the database in this stage — models only
- Keep models thin: no business logic on the model layer
- Use module-level cached promise pattern for serverless-safe connection caching
- `connectDB()` must throw a clear error if `MONGODB_URI` is not set

## History

- **Stage 01 – Project Setup**: Bootstrapped Next.js 16 app with App Router, TypeScript, Tailwind CSS v4, ShadCN UI (8 baseline components), Inter font, root layout with navbar, landing page with CTA, and `.env.local.example`. Build passes clean with no TypeScript errors.
- **Stage 02 – Authentication with Clerk**: Installed `@clerk/nextjs` and `@clerk/ui`. Added `ClerkProvider` with shadcn theme, Clerk proxy middleware protecting app routes, auth-aware navbar, GitHub OAuth sign-in page, protected app shell with sidebar nav, placeholder dashboard, and `lib/auth.ts` `getCurrentUser()` helper. No sign-up page — GitHub OAuth handles new users. Build passes clean.
