# Stage 02 – Authentication with Clerk

## Goal
Add authentication to the app using Clerk, supporting GitHub and Google OAuth. Protect all app routes and expose the current user identity to the rest of the application.

## Dependencies
- Stage 01 complete
- Clerk account + application created
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` and `CLERK_SECRET_KEY` added to `.env.local`

## Deliverables

### 1. Clerk Installation & Setup
- Install `@clerk/nextjs`
- Wrap the root layout in `<ClerkProvider>`
- Configure Clerk middleware (`middleware.ts` at root) to protect all routes under `/(app)/` and allow public access to `/`, `/sign-in`, `/sign-up`

### 2. Sign-In / Sign-Up Pages
- Create `app/(auth)/sign-in/[[...sign-in]]/page.tsx` rendering Clerk's `<SignIn />` component
- Create `app/(auth)/sign-up/[[...sign-up]]/page.tsx` rendering Clerk's `<SignUp />` component
- Both pages should be centred, clean, and use the base layout shell

### 3. Auth-Aware Navigation
- Update the top nav to show:
  - "Sign In" / "Sign Up" buttons when logged out
  - User avatar + "Sign Out" option when logged in (use Clerk's `<UserButton />`)

### 4. Protected App Shell
- Create `app/(app)/layout.tsx` — a protected layout that:
  - Redirects unauthenticated users to `/sign-in`
  - Renders a sidebar or top nav for app navigation (placeholder links for Dashboard, Timeline, Settings)
- Create `app/(app)/dashboard/page.tsx` — placeholder page: "Dashboard (coming soon)"

### 5. User Object Access
- Create `lib/auth.ts` exporting a thin helper `getCurrentUser()` that calls Clerk's `auth()` and returns `{ userId, user }` for use in server components and API routes

## Environment Variables Required
```
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard
```

## Acceptance Criteria
- Visiting `/dashboard` when logged out redirects to `/sign-in`
- GitHub and Google OAuth login both succeed and redirect to `/dashboard`
- Signed-in user avatar appears in the nav
- Sign out works and redirects to `/`
- TypeScript compiles with no errors

## Notes
- No database interaction in this stage — user data lives entirely in Clerk
- The Clerk `userId` will be used as the primary user identifier throughout the app
- Use the Clerk mcp server when required
