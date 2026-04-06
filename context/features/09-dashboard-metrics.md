# Stage 09 – Dashboard Metrics & Summary Cards

## Goal
Build the main Dashboard page with summary metric cards that give the user an at-a-glance view of their productivity for the current week.

## Dependencies
- Stage 07 complete (`GET /api/sessions` works and sessions are computed)

## Deliverables

### 1. Insights Summary API (`app/api/insights/route.ts`) — GET

**Query Parameters:**
| Param | Type | Default |
|-------|------|---------|
| `from` | ISO date | start of current week (Monday) |
| `to` | ISO date | now |

**Computed values** (derived from Sessions + Events in the window):
```json
{
  "totalCodingMinutes": 210,
  "flowSessionCount": 5,
  "avgFlowDurationMinutes": 42,
  "longestFlowMinutes": 68,
  "contextSwitchesTotal": 14,
  "avgContextSwitchesPerDay": 2.8,
  "activeDays": 3,
  "topRepos": [
    { "repo": "owner/api", "eventCount": 24 },
    { "repo": "owner/frontend", "eventCount": 18 }
  ]
}
```

Implementation notes:
- Query `Session` collection for the window
- `totalCodingMinutes` = sum of all session `durationMinutes`
- `contextSwitchesTotal` = sum of all session `contextSwitches`
- `topRepos` = aggregate events by repo, top 5
- Return 200 with empty/zero values if no data (do not return 404)

### 2. Dashboard Page (`app/(app)/dashboard/page.tsx`)
Async Server Component — fetch insights data directly from MongoDB and pass as props to client sub-components. Replace the placeholder with a real dashboard layout.

#### Metric Cards Row
Four ShadCN `Card` components displayed in a 2×2 or 4-column grid:
- **Total Coding Time** — `totalCodingMinutes` formatted as "X hr Y min"
- **Flow Sessions** — `flowSessionCount` with subtext "this week"
- **Avg Flow Duration** — `avgFlowDurationMinutes` formatted as "X min"
- **Context Switches** — `contextSwitchesTotal` with subtext "this week"

#### Active Days
A simple row of 7 day-of-week labels (Mon–Sun), each highlighted if the user had activity that day.

#### Top Repos
A ShadCN `Table` showing the top 5 repos by event count for the week.

### 3. Metric Card Component (`components/dashboard/MetricCard.tsx`)
Wraps ShadCN `Card`, `CardHeader`, `CardContent`. Props:
- `label: string`
- `value: string`
- `subtext?: string`
- `trend?: 'up' | 'down' | 'neutral'` (reserved for future use — render nothing for now)

### 4. Date Range Selector
- ShadCN `Tabs` with values "This Week" / "Last 7 Days" / "Last 14 Days"
- This is a client component — changing the tab triggers a client-side re-fetch from `GET /api/insights` with updated `from`/`to`

### 5. Loading & Empty States
- While loading: ShadCN `Skeleton` versions of each metric card
- If `flowSessionCount === 0`: show an onboarding prompt — "No activity yet. Sync your GitHub account to get started." with a ShadCN `Button` ("Sync Now") that calls `POST /api/github/sync`

## Acceptance Criteria
- Dashboard loads and displays correct values for the current week
- All four metric cards show non-zero values after a sync
- Date range toggle updates all metrics
- "Sync Now" button triggers a sync and refreshes the dashboard
- Empty/loading states render correctly

## Notes
- This page is server-rendered (async Server Component) with client sub-components for interactivity
- Keep the layout clean and spacious — this is the user's first impression after login
