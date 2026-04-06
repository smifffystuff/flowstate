# Stage 05 – GitHub Event Sync

## Goal
Implement the `POST /api/github/sync` endpoint that fetches the user's commits and pull request events from the GitHub API, deduplicates them, and stores them as `Event` documents in MongoDB.

## Dependencies
- Stage 04 complete (GitHub token stored and retrievable)

## Deliverables

### 1. GitHub API Client (`lib/github.ts`)
A thin wrapper around the GitHub REST API using `fetch` (no Octokit dependency needed for MVP).

Functions to implement:
- `getUserRepos(token: string): Promise<Repo[]>` — fetch the user's repositories (owned + member, last updated, max 50)
- `getCommits(token: string, owner: string, repo: string, since: Date): Promise<RawCommit[]>` — fetch commits authored by the authenticated user since a given date
- `getPullRequests(token: string, owner: string, repo: string, since: Date): Promise<RawPR[]>` — fetch PRs where the user is author or reviewer, updated since a given date

Use the `Authorization: Bearer <token>` header. Respect GitHub's rate limit headers — if remaining is 0, throw a descriptive error rather than retrying in a loop.

### 2. Event Normalisation (`lib/events.ts`)
Functions to map raw GitHub data to the `Event` schema:
- `normaliseCommit(raw, userId, repo): EventDocument`
  - `type: 'commit'`
  - `githubId`: commit SHA
  - `timestamp`: commit author date
  - `metadata.message`: first line of commit message
- `normalisePR(raw, userId, repo): EventDocument`
  - `type`: `pr_open` if `created_at` is recent, `pr_update` otherwise
  - `githubId`: PR node_id + event type (to allow multiple events per PR)
  - `timestamp`: `created_at` or `updated_at` depending on type
  - `metadata.prNumber`, `metadata.prTitle`, `metadata.url`

### 3. Sync API Route (`app/api/github/sync/route.ts`) — POST
- Authenticate the caller via Clerk (`auth()`)
- Load the user's encrypted token and decrypt it
- Determine sync window: last 14 days (initial sync) or since `lastSyncAt` on the User document
- For each repo (up to 50):
  - Fetch commits + PRs
  - Normalise to events
  - Bulk upsert using `insertMany` with `ordered: false` + unique index on `{ userId, githubId }` for deduplication
- Update `User.lastSyncAt = new Date()`
- Return `{ inserted: number, skipped: number, repos: number }`

### 4. Rate Limit & Error Handling
- If GitHub returns 401: mark `githubConnected: false` on the user, return 401 with a clear message
- If GitHub returns 403 (rate limit): return 429 with retry hint
- Wrap the entire sync in a try/catch; partial failures per-repo should be logged but not abort the whole sync

## Environment Variables Required
No new variables — uses `GITHUB_CLIENT_ID`/`SECRET` and `TOKEN_ENCRYPTION_KEY` from Stage 04.

## Acceptance Criteria
- `POST /api/github/sync` with a valid session returns `{ inserted, skipped, repos }`
- Running sync twice does not create duplicate events (deduplication via unique index)
- Events appear in MongoDB with correct `type`, `timestamp`, `repo`, and `metadata`
- Unauthenticated requests return 401

## Notes
- Do not paginate deeply for MVP — limit to 100 commits and 50 PRs per repo
- Filter commits to only those authored by the authenticated user (`author` param on GitHub API)
- Sync is synchronous for MVP (runs within the request); background processing is a future enhancement
