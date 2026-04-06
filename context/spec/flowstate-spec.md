# FlowState – Product Specification

## 🧠 Overview

FlowState is a web-based developer productivity tool that automatically tracks and analyses a developer’s work activity to identify deep work (“flow”) sessions, context switching, and productivity patterns.

The system integrates with GitHub and optionally browser activity to build a timeline of developer activity without requiring manual input.

---

## 🎯 Goals

- Eliminate manual time tracking
- Provide meaningful insights into developer productivity
- Identify:
  - Deep work sessions
  - Context switching frequency
  - Work patterns over time
- Deliver value immediately after connecting GitHub

---

## 🚫 Non-Goals (MVP)

- No team collaboration features
- No billing / paid plans
- No heavy AI features initially
- No IDE plugins (future consideration)

---

## 👤 Target Users

- Individual developers
- Freelancers
- Engineers interested in productivity optimisation

---

## 🔑 Core Features (MVP)

### 1. Authentication
- OAuth login via:
  - GitHub
  - Google
- Session management via Clerk (or equivalent)

---

### 2. GitHub Integration

#### Data Collected:
- User repositories
- Commits (timestamp, repo, message)
- Pull Requests:
  - Created
  - Updated
  - Reviewed

#### Sync Strategy:
- Initial full sync (last 7–14 days)
- Incremental sync (polling or webhook later)

---

### 3. Activity Timeline

A chronological view of developer activity.

#### Example Events:
{
  "timestamp": "2026-04-06T10:15:00Z",
  "type": "commit",
  "repo": "my-api",
  "metadata": {
    "message": "Fix auth bug"
  }
}

---

### 4. Flow Session Detection

#### Definition:
A "flow session" is a continuous period of activity with minimal interruption.

#### Rules (Initial Heuristic):
- Events within 5–10 minutes of each other → same session
- Gap > 10 minutes → new session

#### Output:
{
  "start": "10:00",
  "end": "10:45",
  "duration_minutes": 45,
  "event_count": 6,
  "repos": ["api", "frontend"]
}

---

### 5. Context Switching Detection

#### Definition:
Switching between different repos/tasks in a short period.

#### Detection:
- Multiple repos within a single session
- Rapid alternation between repos

#### Metrics:
- Context switches per day
- Avg session focus (single repo vs multi-repo)

---

### 6. Dashboard

#### Key Metrics:
- Total coding time (derived)
- Number of flow sessions
- Average flow duration
- Context switches

#### Visuals:
- Timeline (daily activity)
- Session blocks (calendar-style)
- Repo distribution

---

### 7. Insights Engine (Basic Rules)

Generate simple insights:

Examples:
- "You had 3 deep work sessions today"
- "You switched context 12 times"
- "Your longest flow session was 52 minutes"

---

## 🧱 System Architecture

### Frontend
- Next.js (hosted on Vercel)
- Tailwind CSS
- ShadCN UI for all shared components (buttons, cards, inputs, badges, toasts, etc.)
- Auth via Clerk
- **Rendering strategy:** all pages are async Server Components; client components (`'use client'`) are used only where interactivity or browser APIs are required

### Backend
- Vercel Serverless Functions
- REST API

### Database
- MongoDB Atlas

---

## 🗃️ Data Model (MongoDB)

### Users
{
  "_id": "user_id",
  "email": "user@example.com",
  "provider": "github|google",
  "github_access_token": "encrypted",
  "created_at": "ISODate"
}

---

### Events
{
  "_id": "event_id",
  "user_id": "user_id",
  "timestamp": "ISODate",
  "type": "commit|pr_open|pr_review",
  "repo": "repo_name",
  "metadata": {
    "message": "commit message"
  }
}

---

### Sessions
{
  "_id": "session_id",
  "user_id": "user_id",
  "start": "ISODate",
  "end": "ISODate",
  "duration_minutes": 45,
  "event_ids": ["event1", "event2"],
  "repo_count": 2
}

---

## 🔄 Data Flow

1. User logs in
2. User connects GitHub
3. System fetches events
4. Events stored in MongoDB
5. Session engine processes events
6. Dashboard queries sessions + events
7. Insights generated

---

## 🔌 API Endpoints (MVP)

### Auth
- Handled by Clerk

### GitHub
- POST /api/github/sync

### Events
- GET /api/events

### Sessions
- GET /api/sessions

### Insights
- GET /api/insights

---

## ⚙️ Background Processing

### Option 1 (Simple MVP)
- Trigger sync on login
- Manual "Sync Now" button

### Option 2 (Later)
- Scheduled jobs (cron)
- GitHub webhooks

---

## 🔐 Security Considerations

- Store GitHub tokens encrypted
- Use HTTPS only
- Scope GitHub permissions minimally:
  - repo
  - read:user

---

## 📈 Future Enhancements

- Browser extension (track docs, StackOverflow)
- IDE integration
- AI insights
- Team dashboards
- Weekly reports
- Slack integration

---

## 🛠️ Engineering Standards

- **Rendering:** pages are Server Components by default; add `'use client'` only at the leaf component that requires interactivity or browser APIs
- **Components:** use ShadCN (`shadcn/ui`) for all UI primitives — buttons, cards, inputs, selects, badges, skeletons, toasts, dialogs, tabs, and tables
- **Git branching:** use `git switch` (not `git checkout`) for all branch operations
- **Testing:** each feature stage includes integration tests covering the full request/response cycle (API routes tested against a real test database; UI flows tested with Playwright or Cypress)

---

## 🧪 MVP Definition

- GitHub login
- Event ingestion
- Session detection
- Basic dashboard
- Simple insights

---

## 🚀 Deployment

- Platform: Vercel
- Database: MongoDB Atlas
- Auth: Clerk

---

## 📝 Open Questions

- Optimal session gap threshold?
- Initial sync depth?
- Precompute sessions or on demand?
- GitHub API rate limits?

---

## 💡 Success Criteria

- User sees value within 60 seconds
- Insightful dashboard
- No manual input required
