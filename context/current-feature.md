# Current Feature: Stage 04 – GitHub Connection & Token Storage

## Status

In Progress

## Goals

- Clicking "Connect GitHub" initiates the OAuth flow (redirects to GitHub with correct params + CSRF state cookie)
- After authorising, user is redirected back to `/dashboard`
- MongoDB User document has `githubConnected: true` and an encrypted (AES-256-GCM) token
- Settings page correctly shows "Connected ✓" or "Connect GitHub" button with connected GitHub username
- CSRF state mismatch returns a 400 error

## Notes

- Two API routes: `app/api/github/connect/route.ts` (GET — initiates OAuth) and `app/api/github/callback/route.ts` (GET — code exchange + token storage)
- `lib/crypto.ts`: `encrypt(plaintext)` / `decrypt(ciphertext)` using Node's built-in `crypto`, AES-256-GCM, format `iv:authTag:ciphertext` hex
- `lib/users.ts`: `getOrCreateUser(clerkUserId, email)` and `setGithubToken(clerkUserId, token)` helpers
- `app/(app)/settings/page.tsx`: connection status UI + "Settings" link added to sidebar
- Uses a **separate** GitHub OAuth App from Clerk — required to get `repo` scope token that Clerk doesn't expose
- `TOKEN_ENCRYPTION_KEY` must be 64-char hex (32 bytes); do NOT log raw token anywhere
- Required env vars: `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET`, `GITHUB_REDIRECT_URI`, `TOKEN_ENCRYPTION_KEY`

## History

- **Stage 01 – Project Setup**: Bootstrapped Next.js 16 app with App Router, TypeScript, Tailwind CSS v4, ShadCN UI (8 baseline components), Inter font, root layout with navbar, landing page with CTA, and `.env.local.example`. Build passes clean with no TypeScript errors.
- **Stage 02 – Authentication with Clerk**: Installed `@clerk/nextjs` and `@clerk/ui`. Added `ClerkProvider` with shadcn theme, Clerk proxy middleware protecting app routes, auth-aware navbar, GitHub OAuth sign-in page, protected app shell with sidebar nav, placeholder dashboard, and `lib/auth.ts` `getCurrentUser()` helper. No sign-up page — GitHub OAuth handles new users. Build passes clean.
- **Stage 03 – Database Setup**: Installed `mongoose`. Created `lib/db.ts` with serverless-safe cached `connectDB()`. Defined `User` (unique index on `clerkUserId`), `Event` (compound index `{ userId, timestamp }`, unique index `{ userId, githubId }`), and `Session` (index on `{ userId, start }`) Mongoose models with TypeScript interfaces. Re-exported all from `lib/models/index.ts`. Build passes clean.
