# Stage 04 – GitHub Connection & Token Storage

## Goal
Allow a signed-in user to connect their GitHub account via OAuth, obtain an access token scoped to the required permissions, encrypt it, and store it against their user record in MongoDB.

## Dependencies
- Stage 03 complete
- GitHub OAuth App created (Settings → Developer settings → OAuth Apps)
- `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET`, `TOKEN_ENCRYPTION_KEY` added to `.env.local`

## Deliverables

### 1. GitHub OAuth Flow
The flow is a standard OAuth 2.0 authorisation code exchange, implemented as two Next.js API routes:

**`app/api/github/connect/route.ts`** (GET)
- Redirects the user to GitHub's authorisation URL with:
  - `client_id`
  - `scope=repo read:user`
  - `redirect_uri` pointing to the callback route
  - `state` (a random CSRF token stored in a short-lived cookie)

**`app/api/github/callback/route.ts`** (GET)
- Validates the `state` cookie to prevent CSRF
- Exchanges the `code` query param for an access token via `https://github.com/login/oauth/access_token`
- Encrypts the token (see section 2)
- Upserts the `User` document: set `githubAccessToken`, `githubConnected: true`
- Redirects to `/dashboard`

### 2. Token Encryption
- Create `lib/crypto.ts` with two functions:
  - `encrypt(plaintext: string): string` — AES-256-GCM, returns `iv:authTag:ciphertext` as a hex-joined string
  - `decrypt(ciphertext: string): string` — reverses the above
- Use Node's built-in `crypto` module (no external dependency)
- Key is read from `TOKEN_ENCRYPTION_KEY` (must be 32 bytes / 64 hex chars)

### 3. User Upsert Helper
- Create `lib/users.ts` with:
  - `getOrCreateUser(clerkUserId: string, email: string): Promise<User>` — finds or creates the MongoDB User document
  - `setGithubToken(clerkUserId: string, token: string): Promise<void>` — encrypts and stores the token

### 4. Settings / Connect Page
- Create `app/(app)/settings/page.tsx`
- Shows GitHub connection status: "Connected ✓" or "Connect GitHub" button
- "Connect GitHub" button links to `/api/github/connect`
- After connecting, show the connected GitHub username (fetch from stored user doc or Clerk metadata)
- Add a "Settings" link to the app sidebar/nav

## Environment Variables Required
```
GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=
GITHUB_REDIRECT_URI=http://localhost:3000/api/github/callback
TOKEN_ENCRYPTION_KEY=   # 64-char hex string
```

## Acceptance Criteria
- Clicking "Connect GitHub" initiates the OAuth flow
- After authorising, the user is redirected back to `/dashboard`
- The MongoDB User document has `githubConnected: true` and an encrypted token
- The Settings page correctly shows "Connected" status
- CSRF state mismatch returns a 400 error

## Notes
- This stage uses a separate GitHub OAuth App, not Clerk's GitHub OAuth — this is intentional because we need a token with `repo` scope that Clerk does not expose
- Do not log the raw token anywhere
- The `TOKEN_ENCRYPTION_KEY` must be generated securely (e.g. `openssl rand -hex 32`)
