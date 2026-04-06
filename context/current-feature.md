# Current Feature: Stage 01 – Project Setup

## Status

In Progress

## Goals

- New Next.js app with App Router, TypeScript, and Tailwind CSS configured
- ShadCN UI initialized with baseline components: `button`, `card`, `badge`, `skeleton`, `input`, `select`, `separator`, `tooltip`
- Correct folder structure: `app/`, `components/ui/`, `lib/`
- Root layout with HTML shell, Inter font via `next/font`, global Tailwind styles
- Simple top navigation bar component (logo + placeholder nav links)
- Landing page with headline, subheading, and "Get Started" CTA button
- `.env.local.example` listing all required env vars (empty values)
- `npm run dev` starts with no errors; landing page renders at `localhost:3000`
- TypeScript compiles with no errors (`npm run build`)
- ShadCN `Button` and `Card` render correctly on the landing page

## Notes

- No auth, database, or API logic in this stage
- Keep the landing page minimal — not revisited until polish stage
- ShadCN components live in `components/ui/` — do not hand-edit; extend via wrapper components
- All branch operations use `git switch` (never `git checkout`)

## History

