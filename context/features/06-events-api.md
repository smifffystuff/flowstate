# Stage 06 – Events API

## Goal
Expose a `GET /api/events` endpoint so the frontend can query the authenticated user's stored activity events with filtering and pagination.

## Dependencies
- Stage 05 complete (events are being written to MongoDB)

## Deliverables

### 1. Events API Route (`app/api/events/route.ts`) — GET

**Query Parameters:**
| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `from` | ISO date string | 14 days ago | Start of time range |
| `to` | ISO date string | now | End of time range |
| `repo` | string | — | Filter to a specific repo |
| `type` | string | — | Filter to a specific event type |
| `limit` | number | 200 | Max events to return |
| `offset` | number | 0 | Pagination offset |

**Response:**
```json
{
  "events": [
    {
      "id": "...",
      "timestamp": "2026-04-06T10:15:00Z",
      "type": "commit",
      "repo": "owner/my-api",
      "metadata": { "message": "Fix auth bug" }
    }
  ],
  "total": 42,
  "hasMore": false
}
```

**Implementation:**
- Authenticate via `auth()` (return 401 if not signed in)
- Build a MongoDB query on the `Event` collection filtered by `userId` and `timestamp` range
- Apply optional `repo` and `type` filters
- Sort by `timestamp` descending
- Return paginated results

### 2. Input Validation
- Validate and parse date strings — return 400 if invalid
- Clamp `limit` to max 500
- Only allow `type` values from the known enum (`commit`, `pr_open`, `pr_update`, `pr_review`)

### 3. Repo List Endpoint (`app/api/events/repos/route.ts`) — GET
- Returns the distinct list of repo names for the current user
- Used to populate filter dropdowns in the UI
```json
{ "repos": ["owner/api", "owner/frontend"] }
```

## Acceptance Criteria
- `GET /api/events` returns events for the authenticated user
- Date range filtering works correctly
- Repo and type filters narrow results
- Unauthenticated requests return 401
- Invalid date params return 400 with a descriptive message
- `GET /api/events/repos` returns distinct repo names

## Notes
- Events are read-only via the API — creation only happens via the sync route
- The 200-event default limit is sufficient for the timeline UI; do not over-engineer pagination for MVP
