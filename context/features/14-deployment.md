# Stage 14 – Deployment to Vercel

## Goal
Deploy the application to Vercel, configure all environment variables for production, and verify the end-to-end flow works in the deployed environment.

## Dependencies
- All previous stages complete and working locally
- Vercel account with a linked project
- MongoDB Atlas cluster with network access open to `0.0.0.0/0` (or Vercel IP ranges)
- Clerk production application configured
- GitHub OAuth App with production callback URL

## Deliverables

### 1. Vercel Project Setup
- Link the repository to a Vercel project (`vercel link` or via the Vercel dashboard)
- Set the framework preset to **Next.js**
- Ensure the build command is `next build` and output directory is `.next`

### 2. Environment Variables
Configure the following in the Vercel dashboard under **Settings → Environment Variables** (set for Production, Preview, and Development as appropriate):

```
# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
CLERK_SECRET_KEY
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard

# MongoDB
MONGODB_URI

# GitHub OAuth
GITHUB_CLIENT_ID
GITHUB_CLIENT_SECRET
GITHUB_REDIRECT_URI=https://<your-production-domain>/api/github/callback

# Encryption
TOKEN_ENCRYPTION_KEY
```

### 3. GitHub OAuth App — Production Callback
- Update (or create a second) GitHub OAuth App with:
  - Homepage URL: `https://<your-production-domain>`
  - Callback URL: `https://<your-production-domain>/api/github/callback`

### 4. Clerk Production Instance
- Create a Clerk production application (separate from dev)
- Enable GitHub and Google social providers
- Set allowed redirect URLs to include the production domain

### 5. MongoDB Atlas Network Access
- Ensure the Atlas cluster allows connections from Vercel's IP ranges
- For simplicity in MVP: allow `0.0.0.0/0` (all IPs) — note this in the README as a security consideration to tighten later

### 6. Smoke Test Checklist
After deploying, verify:
- [ ] Landing page loads at the production URL
- [ ] Sign in with GitHub works
- [ ] Sign in with Google works
- [ ] Redirected to Dashboard after sign in
- [ ] Settings page shows correct GitHub connection status
- [ ] "Connect GitHub" initiates OAuth and returns to Dashboard
- [ ] "Sync Now" fetches events and updates the Dashboard
- [ ] Timeline page shows events
- [ ] Insights appear on Dashboard

### 7. Preview Deployments
- Confirm that Vercel preview deployments work for feature branches
- Note: preview deployments will use the same env vars — consider setting `GITHUB_REDIRECT_URI` dynamically using `VERCEL_URL` if needed (or use a separate GitHub OAuth App for previews)

## Acceptance Criteria
- Production deployment builds successfully with no errors
- All smoke test checklist items pass
- No secrets are exposed in client-side bundles (verify with browser DevTools)
- `HTTPS` is enforced (Vercel handles this automatically)

## Notes
- Do not commit `.env.local` — it is already in `.gitignore`
- The Vercel CLI (`vercel env pull`) can sync production env vars to local `.env.local` for debugging
- MongoDB Atlas free tier (M0) is sufficient for MVP
