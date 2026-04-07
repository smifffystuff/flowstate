# Current Feature: Stage 02 – Authentication with Clerk

## Status

In Progress

## Goals

- Install `@clerk/nextjs` and wrap root layout in `<ClerkProvider>`
- Configure `middleware.ts` to protect `/(app)/` routes and allow public access to `/`, `/sign-in`, `/sign-up`
- Create sign-in page at `app/(auth)/sign-in/[[...sign-in]]/page.tsx` using Clerk's `<SignIn />` component
- Create sign-up page at `app/(auth)/sign-up/[[...sign-up]]/page.tsx` using Clerk's `<SignUp />` component
- Update top nav to show sign-in/sign-up buttons when logged out and `<UserButton />` when logged in
- Create `app/(app)/layout.tsx` — protected layout redirecting unauthenticated users to `/sign-in` with placeholder nav links
- Create `app/(app)/dashboard/page.tsx` — placeholder "Dashboard (coming soon)" page
- Create `lib/auth.ts` exporting `getCurrentUser()` helper wrapping Clerk's `auth()`
- Visiting `/dashboard` when logged out redirects to `/sign-in`
- GitHub and Google OAuth login succeed and redirect to `/dashboard`
- TypeScript compiles with no errors

## Notes

- No database interaction in this stage — user data lives entirely in Clerk
- The Clerk `userId` will be the primary user identifier throughout the app
- The GitHub OAuth app used for Clerk is separate from the one used for repository access (stage 03+)
- Clerk env vars required: `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY`, `NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in`, `NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up`, `NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard`, `NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard`
- Use the Clerk MCP server when required

## History

- **Stage 01 – Project Setup**: Bootstrapped Next.js 16 app with App Router, TypeScript, Tailwind CSS v4, ShadCN UI (8 baseline components), Inter font, root layout with navbar, landing page with CTA, and `.env.local.example`. Build passes clean with no TypeScript errors.
