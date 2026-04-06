# Stage 11 – Insights Engine

## Goal
Generate human-readable insight messages from the user's session and event data, and display them on the Dashboard as a "Your Insights" section.

## Dependencies
- Stage 09 complete (`GET /api/insights` returns computed metrics)

## Deliverables

### 1. Insights Generator (`lib/insights.ts`)

A pure function:
```ts
function generateInsights(metrics: InsightMetrics): Insight[]
```

**Input:** The metrics object from `GET /api/insights`.

**Output:** An array of `Insight` objects:
```ts
type Insight = {
  id: string        // stable key for React
  type: 'positive' | 'neutral' | 'warning'
  message: string
}
```

**Rules to implement (evaluate in order, include all that apply):**

| Condition | Type | Message |
|-----------|------|---------|
| `flowSessionCount >= 3` | positive | "You had {n} deep work sessions today / this week" |
| `longestFlowMinutes >= 45` | positive | "Your longest flow session was {n} minutes — great focus!" |
| `avgFlowDurationMinutes >= 30` | positive | "Your average flow session was {n} minutes" |
| `contextSwitchesTotal >= 10` | warning | "You switched context {n} times — consider batching tasks" |
| `contextSwitchesTotal > 0 && < 10` | neutral | "You switched context {n} times this week" |
| `activeDays >= 5` | positive | "You coded {n} days this week — excellent consistency!" |
| `activeDays <= 2 && activeDays > 0` | neutral | "You were active {n} day(s) this week" |
| `flowSessionCount === 0` | neutral | "No flow sessions detected yet — sync your GitHub to get started" |
| `totalCodingMinutes > 0` | neutral | "Total estimated coding time: {h}h {m}min" |

Generate at most 5 insights (pick the most specific/interesting ones).

### 2. Extend Insights API
- Call `generateInsights()` in `GET /api/insights` and include the result in the response:
```json
{
  ...,
  "insights": [
    { "id": "flow-count", "type": "positive", "message": "You had 3 deep work sessions this week" },
    { "id": "context-switches", "type": "warning", "message": "You switched context 14 times — consider batching tasks" }
  ]
}
```

### 3. Insights Panel (`components/dashboard/InsightsPanel.tsx`)
A card displayed on the Dashboard showing the list of insights:
- Section title: "Your Insights"
- Each insight rendered as a row with:
  - A colour-coded icon: ✓ green (positive), → grey (neutral), ⚠ amber (warning)
  - The insight message
- If no insights: "Complete a sync to generate insights"

### 4. Dashboard Layout Update
Add the `InsightsPanel` to the Dashboard below the charts.

## Acceptance Criteria
- After a sync with real data, at least 2 insights appear on the Dashboard
- Warning insights appear for high context-switch counts
- Positive insights appear for long or frequent flow sessions
- Insights update when the date range selector changes
- "No insights" state shows correctly before first sync

## Notes
- Insights are computed on-the-fly in the API — they are not stored in MongoDB
- Keep message strings concise (under 80 characters)
- Do not add AI/LLM calls in this stage — this is the rules-based engine only
