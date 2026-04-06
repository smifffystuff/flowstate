# Stage 10 – Dashboard Visualisations

## Goal
Add visual charts to the Dashboard: a daily activity bar chart, a session block timeline (calendar-style), and a repo distribution chart.

## Dependencies
- Stage 09 complete (Dashboard metrics and `GET /api/insights` work)

## Deliverables

### 1. Charting Library
- Install `recharts` (lightweight, React-native, no canvas dependency issues with SSR)
- All chart components must be client components (`'use client'`)
- Wrap each chart in a ShadCN `Card` for consistent framing and spacing

### 2. Daily Activity Bar Chart (`components/dashboard/ActivityBarChart.tsx`)
- Horizontal axis: days of the selected week (Mon → Sun)
- Vertical axis: total coding minutes per day
- Data source: extend `GET /api/insights` response to include:
  ```json
  "dailyMinutes": [
    { "date": "2026-04-01", "minutes": 90 },
    { "date": "2026-04-02", "minutes": 0 },
    ...
  ]
  ```
- Bars coloured with the app's primary accent colour
- Tooltip showing "X hr Y min" on hover
- Zero-minute days shown as empty bars (not omitted)

### 3. Session Block Timeline (`components/dashboard/SessionTimeline.tsx`)
A visual representation of flow sessions for the current day (or selected date):
- 24-hour horizontal time axis (00:00 → 23:59)
- Each flow session rendered as a coloured horizontal block
- Block width proportional to session duration
- Hovering a block shows: start time, end time, duration, repos involved
- If no sessions today, show a subtle "No flow sessions recorded today" message

Data source: `GET /api/sessions?from=<today-start>&to=<today-end>`

### 4. Repo Distribution Chart (`components/dashboard/RepoDistributionChart.tsx`)
- A horizontal bar chart (or simple percentage bar list) showing the top 5 repos
- Each bar represents that repo's share of total events in the selected period
- Repo name label on the left, event count + percentage on the right
- Data comes from `topRepos` already in the insights response

### 5. Dashboard Layout Update
Arrange the new charts below the metric cards:
```
[ Metric Cards Row                    ]
[ Activity Bar Chart | Session Timeline ]
[ Repo Distribution Chart              ]
```

Responsive: charts stack vertically on mobile.

### 6. Extend Insights API
Add `dailyMinutes` array to `GET /api/insights` response (see section 2 above).

## Acceptance Criteria
- All three charts render with real data after a sync
- Activity bar chart shows correct per-day values
- Session timeline correctly places blocks at the right time positions
- Repo distribution shows top repos with proportional bars
- Charts are responsive and don't overflow on small screens
- Hovering chart elements shows tooltips

## Notes
- Do not use server-side chart rendering — all charts are client components
- If Recharts causes SSR issues, wrap chart components in `dynamic(() => import(...), { ssr: false })`
- Keep chart colour palette to 2–3 colours for visual clarity
