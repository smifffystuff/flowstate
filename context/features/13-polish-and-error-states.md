# Stage 13 – Polish & Error States

## Goal
Harden the application with proper error boundaries, consistent loading skeletons, empty states, and a polished landing page. Ensure the app is production-ready in terms of UX completeness.

## Dependencies
- All previous stages complete

## Deliverables

### 1. Error Boundary (`components/ErrorBoundary.tsx`)
- A React error boundary wrapping the main app content areas
- On error: render a ShadCN `Card` with "Something went wrong" message and a ShadCN `Button` ("Try again") that calls `window.location.reload()`
- Log errors to the console (structured: `{ error, context }`)
- Wrap the Dashboard, Timeline, and Settings pages individually so one broken section doesn't kill the whole page

### 2. Global Error Page (`app/error.tsx` and `app/(app)/error.tsx`)
- Next.js error page that shows a friendly "Something went wrong" message
- Includes a "Go to Dashboard" link

### 3. Not Found Page (`app/not-found.tsx`)
- Clean 404 page with the app nav and a "Go to Dashboard" button

### 4. Loading Skeletons
Ensure every data-fetching component has a proper skeleton using the ShadCN `Skeleton` component (`npx shadcn@latest add skeleton`):
- Dashboard metric cards: rectangular skeleton blocks matching the card dimensions
- Activity Bar Chart: horizontal grey bars
- Session Timeline: grey timeline bar
- Timeline event list: 5 skeleton rows with icon + text placeholders
- Insights Panel: 3 skeleton rows

Do not build a custom skeleton — use `<Skeleton className="..." />` from ShadCN throughout.

### 5. Consistent Toast Notifications
- Add the ShadCN `Sonner` component (`npx shadcn@latest add sonner`) which wraps the `sonner` library
- Place `<Toaster />` in the root layout
- Use toasts for:
  - Sync success: "GitHub synced successfully"
  - Sync error: "Sync failed: {reason}" (with dismiss)
  - GitHub connected: "GitHub account connected"
  - Any API error that results from a user action

### 6. Landing Page Polish (`app/page.tsx`)
Async Server Component. Update the placeholder landing page with:
- Hero section: headline, subheading, ShadCN `Button` ("Get Started") linking to `/sign-in`
- Features section: 3 ShadCN `Card` components with icons (No manual tracking / Automatic flow detection / GitHub powered)
- Simple footer with GitHub link and "Built with Next.js + Vercel"
- The page should look presentable but does not need to be a full marketing site

### 7. App Navigation Polish
- Active nav link highlighting (current page has distinct styling)
- Mobile-responsive nav (hamburger menu or bottom nav on small screens)
- App title "FlowState" in the sidebar/nav with a simple logo icon

### 8. Responsive Layout Audit
Check all pages on:
- Desktop (1280px+)
- Tablet (768px)
- Mobile (375px)

Fix any overflow, truncation, or layout breakage issues.

## Acceptance Criteria
- No unhandled promise rejections or React render errors in the console
- Every page has a correct loading state before data arrives
- Every page has a correct empty state when there is no data
- Error boundary catches render errors and shows the fallback UI
- Toast notifications appear for sync success and failure
- Landing page looks presentable
- App is usable on mobile (375px width)

## Notes
- Do not add animation libraries — Tailwind's built-in `animate-pulse` and `transition` utilities are sufficient
- Keep the landing page simple — it will be replaced when/if the product launches publicly
- All new components introduced in this stage must use ShadCN primitives; do not hand-roll buttons, cards, or alerts
