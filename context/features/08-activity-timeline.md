# Stage 08 – Activity Timeline UI

## Goal
Build the Activity Timeline page: a chronological, day-grouped list of the user's activity events with basic filtering controls.

## Dependencies
- Stage 06 complete (`GET /api/events` and `GET /api/events/repos` work)

## Deliverables

### 1. Timeline Page (`app/(app)/timeline/page.tsx`)
- Async Server Component — fetch initial events (last 7 days) directly from MongoDB and pass as props to the client component
- Add a "Timeline" link to the app sidebar/nav

### 2. Timeline Client Component (`components/timeline/Timeline.tsx`)
A client component (`'use client'`) responsible only for interactivity:
- Receives initial events as props (pre-fetched by the server)
- Re-fetches from `GET /api/events` only when filters or date range change
- Groups events by calendar day (user's local timezone)
- Renders each day as a labelled section with its events listed below

### 3. Event Item Component (`components/timeline/EventItem.tsx`)
Renders a single event row using ShadCN primitives:
- Icon representing the event type:
  - `commit` → code/commit icon
  - `pr_open` → pull request icon
  - `pr_update` → sync icon
  - `pr_review` → eye/review icon
- Relative time (e.g. "3 hours ago") alongside the absolute time (HH:MM)
- Repo name as a ShadCN `Badge` (variant `secondary`)
- Metadata: commit message (truncated to 80 chars) or PR title

### 4. Filter Bar (`components/timeline/FilterBar.tsx`)
A client component using ShadCN form primitives:
- Date range: two ShadCN `Input` (type `date`), default last 7 days
- Repo dropdown: ShadCN `Select` populated from `GET /api/events/repos`
- Event type dropdown: ShadCN `Select` (All / Commit / PR Open / PR Update / PR Review)
- Filters are applied client-side against the current fetched set — no re-fetch on each filter change for MVP

### 5. Empty & Loading States
- Loading: ShadCN `Skeleton` rows (3 placeholder items per day)
- Empty (no events, GitHub connected): "No activity found — try syncing your GitHub account"
- Empty (GitHub not connected): "Connect your GitHub account to see your activity" with a link to `/settings`

## Acceptance Criteria
- Timeline page shows events grouped by day, most recent first
- Each event shows correct icon, time, repo badge, and message/title
- Repo and type filters narrow the displayed events
- Date range change re-fetches events for the new window
- Loading and empty states render correctly
- Page is responsive (readable on mobile)

## Notes
- Use `Intl.DateTimeFormat` for date/time formatting — do not add a date library for MVP
- Limit to 200 events per fetch (the API default) — no infinite scroll needed for MVP
- Timeline is read-only — no actions on event rows
