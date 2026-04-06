# Stage 03 – Database Setup (MongoDB Atlas)

## Goal
Connect the application to MongoDB Atlas and define the core data models (Users, Events, Sessions) that all subsequent stages depend on.

## Dependencies
- Stage 02 complete
- MongoDB Atlas cluster created and accessible
- `MONGODB_URI` added to `.env.local`

## Deliverables

### 1. MongoDB Connection
- Install `mongoose`
- Create `lib/db.ts` that:
  - Exports a `connectDB()` function
  - Caches the connection across serverless function invocations (standard Next.js/Mongoose pattern using a module-level cached promise)
  - Throws a clear error if `MONGODB_URI` is not set

### 2. User Model (`lib/models/User.ts`)
```ts
{
  _id: ObjectId,
  clerkUserId: string,       // Clerk's userId — used as lookup key
  email: string,
  githubAccessToken: string, // encrypted (Stage 04 adds encryption)
  githubConnected: boolean,
  createdAt: Date,
  updatedAt: Date
}
```
- Index on `clerkUserId` (unique)

### 3. Event Model (`lib/models/Event.ts`)
```ts
{
  _id: ObjectId,
  userId: string,            // clerkUserId
  timestamp: Date,
  type: 'commit' | 'pr_open' | 'pr_update' | 'pr_review',
  repo: string,              // full name e.g. "owner/repo"
  metadata: {
    message?: string,        // commit message
    prNumber?: number,
    prTitle?: string,
    url?: string
  },
  githubId: string           // deduplication key (commit SHA or PR node_id)
}
```
- Compound index on `{ userId, timestamp }` for timeline queries
- Unique index on `{ userId, githubId }` for deduplication

### 4. Session Model (`lib/models/Session.ts`)
```ts
{
  _id: ObjectId,
  userId: string,
  start: Date,
  end: Date,
  durationMinutes: number,
  eventIds: ObjectId[],
  repos: string[],           // distinct repos in session
  repoCount: number,
  contextSwitches: number    // number of repo changes within session
}
```
- Index on `{ userId, start }` for dashboard queries

### 5. Model Exports
- Create `lib/models/index.ts` re-exporting all models

## Environment Variables Required
```
MONGODB_URI=mongodb+srv://...
```

## Acceptance Criteria
- `connectDB()` successfully connects when called from an API route
- All three Mongoose models can be imported without TypeScript errors
- Running `npm run build` succeeds

## Notes
- No data is written to the database in this stage
- GitHub token encryption is deferred to Stage 04 — store as plaintext for now and add a TODO comment
- Keep models thin: no business logic on the model layer
