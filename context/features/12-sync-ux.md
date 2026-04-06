# Stage 12 – Sync UX & Auto-Sync on Login

## Goal
Polish the sync experience: trigger an automatic sync when the user first visits the app, surface sync status throughout the UI, and provide a manual "Sync Now" control.

## Dependencies
- Stage 05 complete (`POST /api/github/sync` works)
- Stage 09 complete (Dashboard exists)

## Deliverables

### 1. Sync Status on User Document
Extend the `User` model (Stage 03) with:
- `lastSyncAt: Date | null` — timestamp of last successful sync
- `syncStatus: 'idle' | 'syncing' | 'error'` — current sync state
- `syncError: string | null` — last error message if status is 'error'

Update `POST /api/github/sync` to:
- Set `syncStatus: 'syncing'` at the start
- Set `syncStatus: 'idle'`, `lastSyncAt: new Date()` on success
- Set `syncStatus: 'error'`, `syncError: message` on failure

### 2. Sync Status API (`app/api/sync/status/route.ts`) — GET
Returns current sync state for the authenticated user:
```json
{
  "syncStatus": "idle",
  "lastSyncAt": "2026-04-06T09:00:00Z",
  "githubConnected": true
}
```

### 3. Auto-Sync on First Visit
In `app/(app)/dashboard/page.tsx`:
- On the server, check `lastSyncAt` from the User document
- If `lastSyncAt` is `null` and `githubConnected: true`, include a flag in the page data indicating a sync should be triggered
- On the client, if the flag is set, automatically call `POST /api/github/sync` on mount (once)

### 4. Sync Button Component (`components/SyncButton.tsx`)
A client component wrapping ShadCN `Button`:
- Calls `POST /api/github/sync` on click
- Uses `variant="outline"` with a `Loader2` spinner icon (lucide-react) while syncing
- On success: briefly shows "Synced ✓" (ShadCN `Badge` variant `success`) then returns to "Sync Now"
- On error: shows "Sync failed" with a retry option
- `disabled` while a sync is in progress
- Displays "Last synced X minutes ago" as muted text below the button using `lastSyncAt`

Place this button in:
- The app top nav / sidebar (always accessible)
- The Dashboard empty state

### 5. GitHub Not Connected State
If `githubConnected: false`:
- Show a dismissible ShadCN `Alert` (variant `default`) at the top of the Dashboard: "Connect your GitHub account to start tracking your activity → [Connect GitHub]"
- The Sync button should be hidden or show "Connect GitHub first"

### 6. Sync Progress Feedback
While sync is running:
- Dashboard metric cards show a subtle loading overlay (not a full spinner — keep the existing content visible)
- After sync completes, refresh metrics and insights automatically (re-fetch `GET /api/insights`)

## Acceptance Criteria
- New user who connects GitHub sees an automatic sync on first dashboard visit
- Sync button shows correct loading / success / error states
- "Last synced" time updates after a successful sync
- GitHub-not-connected banner appears and links to Settings
- Manual sync triggers a refresh of dashboard data

## Notes
- For MVP, concurrent sync requests from the same user are idempotent (the second one just overwrites the first)
- Do not implement polling or server-sent events — simple request/response is sufficient
