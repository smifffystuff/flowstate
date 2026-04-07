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
