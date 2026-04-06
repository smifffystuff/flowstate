# Stage 07 – Flow Session Detection Engine

## Goal
Implement the core algorithm that groups raw activity events into "flow sessions" based on the gap heuristic, computes context switching metrics, and persists the resulting `Session` documents.

## Dependencies
- Stage 05 complete (events exist in MongoDB)

## Deliverables

### 1. Session Detection Algorithm (`lib/sessions.ts`)

**Input:** An array of `Event` documents sorted by `timestamp` ascending.

**Algorithm:**
```
SESSION_GAP_MINUTES = 10

sessions = []
current_session = null

for each event in events (sorted asc):
  if current_session is null:
    start new session with this event
  elif (event.timestamp - last_event.timestamp) <= SESSION_GAP_MINUTES:
    add event to current session
  else:
    close current session
    start new session with this event

close final open session
```

**Session output fields:**
- `start`: timestamp of first event
- `end`: timestamp of last event
- `durationMinutes`: `(end - start)` in minutes
- `eventIds`: array of event `_id` values
- `repos`: distinct repo names in session
- `repoCount`: `repos.length`
- `contextSwitches`: number of times the active repo changes during the session (e.g. A→A→B→A = 2 switches)

**Minimum session threshold:** discard sessions with fewer than 2 events or duration < 1 minute.

### 2. Session Compute API Route (`app/api/sessions/compute/route.ts`) — POST
- Authenticate via `auth()`
- Accept optional `from` / `to` query params (default: last 14 days)
- Fetch all events for the user in that window, sorted ascending
- Run the detection algorithm
- Upsert sessions: delete existing sessions for the user in the time window, then insert the newly computed ones
- Return `{ sessions: number, events: number }`

This route is called automatically at the end of `POST /api/github/sync` (Stage 05 should call this internally after inserting events).

### 3. Sessions Query API Route (`app/api/sessions/route.ts`) — GET

**Query Parameters:**
| Param | Type | Default |
|-------|------|---------|
| `from` | ISO date | 14 days ago |
| `to` | ISO date | now |

**Response:**
```json
{
  "sessions": [
    {
      "id": "...",
      "start": "2026-04-06T10:00:00Z",
      "end": "2026-04-06T10:45:00Z",
      "durationMinutes": 45,
      "eventCount": 6,
      "repos": ["owner/api", "owner/frontend"],
      "repoCount": 2,
      "contextSwitches": 3
    }
  ]
}
```

### 4. Update Sync Route
- Modify `POST /api/github/sync` from Stage 05 to call the session compute logic after inserting events, so sessions are always up to date after a sync.

## Acceptance Criteria
- After a sync, sessions appear in MongoDB
- A single-repo, uninterrupted work period produces `contextSwitches: 0`
- A 10-minute gap between events splits into two sessions
- Sessions with only 1 event are discarded
- `GET /api/sessions` returns sessions in descending `start` order
- Computing sessions twice for the same window is idempotent (delete-then-insert)

## Notes
- Session computation is synchronous and in-process for MVP — no queue or background worker needed
- The `SESSION_GAP_MINUTES` constant should be exported from `lib/sessions.ts` so it can be referenced in the UI
- Do not store sessions that span midnight — allow it for now (future enhancement)
