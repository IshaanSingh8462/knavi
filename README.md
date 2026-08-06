# Knavi — full project export

This is the complete current source, including everything from the original
MVP plus three rounds of fixes made since:

1. **Vercel serverless split** — Express routes extracted into
   `src/server/app.ts` and reused by both `server.ts` (local dev) and
   `api/index.ts` (Vercel serverless function), with `vercel.json` routing
   `/api/*` to it.
2. **ESM import-extension fix** — every relative import in the server-side
   call graph now has an explicit `.js` extension, required by Node's
   native ESM loader under Vercel (`"type": "module"` in `package.json`).
3. **Two bug fixes:**
   - New trails (via "Forge New Task") could get their first node stuck
     `locked` if another trail in the same branch was already active.
     Fixed in `src/server/app.ts` — every new trail now always starts its
     own `branch_order` fresh at 0 with its own first node active.
   - `complete_level` / `revert_level_completion` (in `supabase/schema.sql`)
     only scoped node-unlocking by `task_id` for the `custom` branch —
     fixed to scope by `task_id` for every branch, so multiple trails in
     the same branch can't cross-unlock each other's nodes.
   - The app view reset to the main screen whenever you switched tabs and
     came back. Fixed in `src/App.tsx` — the data-sync effect now keys off
     `user?.id` instead of the whole `user` object, so a routine Supabase
     token refresh on tab focus no longer forces a view reset.

## Setup

1. `npm install`
2. Copy `.env.example` to `.env.local` and fill in your Supabase and Gemini
   credentials.
3. Run `supabase/schema.sql` in the Supabase SQL editor (safe to re-run).
4. Enable **Anonymous Sign-Ins** in Supabase → Authentication → Providers
   (required for the guest/"Enter as Guest" flow).
5. `npm run dev` — runs locally on port 3000.

## Deploying to Vercel

- Push to your repo and import into Vercel as normal — no special build
  command needed. Vercel auto-detects the Vite framework for the static
  build and auto-detects `api/index.ts` as a serverless function.
- In Vercel → Project Settings → Environment Variables, set
  `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, and `GEMINI_API_KEY`.
  `GEMINI_API_KEY` should **not** be prefixed with `VITE_` — it's read
  server-side only, in `api/index.ts`'s call chain.
- Re-run `supabase/schema.sql` against your Supabase project if you
  haven't already applied the completion-scoping fix described above — it
  won't come through automatically via git/Vercel since it's a database
  migration, not application code.

## Project structure

```
index.html                       Vite entry HTML
vite.config.ts                   Vite + Tailwind config
tsconfig.json
package.json
vercel.json                      Routes /api/* to the serverless function
server.ts                        Local dev entry (npm run dev)
api/index.ts                     Vercel serverless function entry

src/
  main.tsx, App.tsx              App root + view routing/auth state
  index.css                      Tailwind theme + Knavi palette
  vite-env.d.ts
  types/index.ts                 Shared TS types

  components/
    Trail.tsx                    Node/path rendering for one trail
    NodeDetail.tsx                Node detail drawer
    JourneyView.tsx               Main daily-trail screen, trail switcher
    Dashboard.tsx                  Streaks + per-trail progress
    WeeklySetup.tsx                 Sunday weekly plan builder
    OnboardingFlow.tsx               Protected-time onboarding
    PublicJourneys.tsx                Gallery + guest sandbox + fork
    Mascot.tsx                        Trail-report mood widget
    BrandHero.tsx                      Sign-in page illustration

  lib/
    constants.ts                 MAX_NODE_DEPTH
    supabase/
      client.ts                  Browser Supabase client
      serverClient.ts             Server-side scoped Supabase client
      queries.ts                   All client-side Supabase calls
    ai/
      client.ts                  Gemini calls + retry/fallback logic
      prompts.ts                   Prompt templates
      schemas.ts                    Zod validation for AI output

  server/
    app.ts                       All Express route logic (shared by
                                  server.ts and api/index.ts)

supabase/
  schema.sql                     Full schema, RLS policies, and functions
                                  (includes the task-scoping fix)
```

## Known open items (unchanged from before this export)
- Freemium/paywall gating — spec'd, not implemented.
- "AI Explanation" button in the node drawer — UI present, disabled, no
  backend wired.
- Only one trail biome ("grassy") — background generation is
  parametrizable but not wired to a picker.
- No real-device mobile testing yet.
- Public Journeys gallery has no pagination (fine at current scale).
