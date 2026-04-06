# Stage 15 – Integration Tests

## Goal
Add a full integration test suite covering API routes end-to-end (real test database) and critical UI flows (browser-level). Every previous feature stage should have corresponding tests by the end of this stage.

## Dependencies
- All previous stages complete
- A separate MongoDB test database available (e.g. a local MongoDB or a separate Atlas cluster)

## Deliverables

### 1. Test Infrastructure Setup

#### API / Server Tests — Vitest
- Install `vitest`, `@vitest/coverage-v8`, `mongodb-memory-server`
- Use `mongodb-memory-server` to spin up an in-process MongoDB instance for each test file — no mocking of the database layer
- Create `vitest.config.ts` with:
  - `environment: 'node'`
  - `setupFiles: ['tests/setup.ts']`
- `tests/setup.ts`:
  - Starts the in-memory MongoDB before all tests
  - Calls `connectDB()` with the in-memory URI
  - Drops all collections after each test (`afterEach`)
  - Stops MongoDB after all tests

#### UI / E2E Tests — Playwright
- Install `@playwright/test` and run `npx playwright install`
- Create `playwright.config.ts`:
  - `baseURL: 'http://localhost:3000'`
  - `webServer` block: starts `next dev` automatically before the test run
  - Run against Chromium only for MVP
- E2E tests live in `tests/e2e/`

### 2. API Integration Tests

#### Auth — `tests/api/auth.test.ts`
- Unauthenticated requests to protected routes (`GET /api/events`, `GET /api/sessions`, `POST /api/github/sync`) return 401

#### Events API — `tests/api/events.test.ts`
- `GET /api/events` returns events for the authenticated user in the requested date range
- `GET /api/events` excludes events belonging to a different user
- `GET /api/events` filters by `repo` and `type` correctly
- `GET /api/events` returns 400 for an invalid date string
- `GET /api/events/repos` returns distinct repo names for the user

#### GitHub Sync — `tests/api/github-sync.test.ts`
- `POST /api/github/sync` (mocking the GitHub API via `vi.mock`) inserts normalised events
- Running sync twice does not create duplicate events (unique index enforcement)
- Sync with a revoked token (GitHub returns 401) marks `githubConnected: false` and returns 401
- After sync, sessions are recomputed and appear in MongoDB

#### Sessions API — `tests/api/sessions.test.ts`
- `GET /api/sessions` returns sessions for the authenticated user
- Sessions are returned in descending `start` order
- `POST /api/sessions/compute` with a set of pre-seeded events produces the correct sessions:
  - Events within the gap threshold form one session
  - Events across the gap threshold form separate sessions
  - Single-event sessions are discarded

#### Insights API — `tests/api/insights.test.ts`
- `GET /api/insights` returns correct `totalCodingMinutes`, `flowSessionCount`, `contextSwitchesTotal` for pre-seeded sessions
- `GET /api/insights` returns zero-value metrics (not 404) when no data exists
- Insights array contains appropriate messages based on metrics

#### Session Engine (unit) — `tests/lib/sessions.test.ts`
- Events within 10 minutes group into one session
- A gap > 10 minutes splits into two sessions
- `contextSwitches` is 0 for a single-repo session
- `contextSwitches` counts correctly for multi-repo alternation
- Minimum event threshold: sessions with 1 event are discarded

#### Crypto (unit) — `tests/lib/crypto.test.ts`
- `encrypt` + `decrypt` roundtrip returns original plaintext
- `decrypt` with a tampered ciphertext throws

### 3. E2E Integration Tests (Playwright)

Tests run against a real Next.js dev server with a test database seeded via a setup script.

#### Auth Flow — `tests/e2e/auth.spec.ts`
- Visiting `/dashboard` unauthenticated redirects to `/sign-in`
- After signing in (use Clerk test mode / test credentials), user lands on `/dashboard`
- Sign out redirects to `/`

#### Dashboard Flow — `tests/e2e/dashboard.spec.ts`
- Dashboard page loads with metric cards visible
- "Sync Now" button is present and clicking it shows a loading state then updates metrics
- Date range tabs ("This Week" / "Last 7 Days" / "Last 14 Days") update the displayed values

#### Timeline Flow — `tests/e2e/timeline.spec.ts`
- Timeline page loads and shows events grouped by day
- Repo filter dropdown narrows displayed events
- Empty state appears when filters match no events

#### Settings Flow — `tests/e2e/settings.spec.ts`
- Settings page shows GitHub connection status
- "Connect GitHub" button is present when not connected

### 4. Test Scripts in `package.json`
```json
"scripts": {
  "test": "vitest run",
  "test:watch": "vitest",
  "test:coverage": "vitest run --coverage",
  "test:e2e": "playwright test",
  "test:e2e:ui": "playwright test --ui"
}
```

### 5. CI Integration
Add a GitHub Actions workflow (`.github/workflows/test.yml`):
- Trigger: push and pull_request on all branches
- Steps:
  1. Checkout + Node 22 setup
  2. `npm ci`
  3. `npm test` (Vitest — unit + API integration)
  4. `npm run test:e2e` (Playwright — requires `CLERK_*` test keys in CI secrets)
- Branch operations in the workflow use `git switch` consistent with project convention

## Acceptance Criteria
- `npm test` passes with no failures
- `npm run test:coverage` reports ≥ 80% line coverage on `lib/` and API route handlers
- `npm run test:e2e` passes all E2E specs against a locally running dev server
- CI workflow runs on every push and PR

## Notes
- The GitHub API is mocked in API integration tests (`vi.mock('../../../lib/github')`) — tests should not make real HTTP calls to GitHub
- E2E tests use Clerk's test mode with hardcoded test credentials — do not use real user accounts in tests
- `mongodb-memory-server` handles database isolation; do not point tests at the real Atlas cluster
- Keep each test file focused on one API route or one UI flow — do not create omnibus test files
