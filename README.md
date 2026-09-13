# Strail — real routing migration

This replaces the single-URL, state-switched SPA with actual routes via
`react-router-dom`. Every file below is either **new** or a **full
replacement** for an existing file at the same path — copy them into your
repo overwriting what's there.

## How to apply

1. Copy every file in this archive into your repo at the matching path
   (e.g. `src/App.tsx` here replaces your `src/App.tsx`).
2. **Delete `src/components/PublicJourneys.tsx`** — it's fully superseded
   by `src/pages/PublicJourneysGalleryPage.tsx` +
   `src/pages/PublicJourneyDetailPage.tsx`. Nothing else imports it anymore.
3. `npm install` (pulls in `react-router-dom`, added to `package.json`).
4. `npm run dev` and click through the flows below.

Nothing under `src/components/` other than `LandingPage.tsx` changed —
`JourneyView`, `Dashboard`, `WeeklySetup`, `OnboardingFlow`, `Trail`,
`NodeDetail`, `ChangePasswordModal`, etc. are reused as-is, just called
from route pages instead of `App.tsx`'s old if/else tree.

## New route map

| Path | Page | Access |
|---|---|---|
| `/` | Landing | anyone signed out |
| `/login`, `/signup` | Sign in / create account | anyone signed out |
| `/guest` | Auto-starts a guest (anonymous) session, redirects to `/journeys` | anyone |
| `/journeys` | Public journeys gallery | **everyone** — anonymous, guest, or signed in |
| `/journeys/:taskId` | **New** — single shareable, indexable journey page | **everyone**, adapts per viewer (see below) |
| `/auth/callback` | Lands here from email-confirm / password-recovery links | — |
| `/reset-password` | Forgot-password request + set-new-password | — |
| `/onboarding` | Protected-time setup | signed in, not yet onboarded |
| `/app` | Daily Trail | signed in, onboarded, non-guest |
| `/app/dashboard` | Standings | same |
| `/app/setup` | Weekly Setup | same |
| `/privacy`, `/terms` | Placeholder legal pages | anyone |
| `*` | 404 | anyone |

### `/journeys/:taskId` — the new shareable public-journey page

This is the actual net-new capability you asked for. One component, three
viewer states, driven entirely by who's looking:

- **Anonymous (no session at all):** read-only trail, no sandbox
  interactivity, "Sign up to fork this" CTA. This is what search engines
  and shared links will see — real crawlable URLs for content that used to
  be locked behind client-side state.
- **Guest (anonymous-auth session from `/guest`):** the same local sandbox
  behavior as before — complete/undo/break-down steps, nothing persists.
- **Signed-in user:** the existing fork flow, unchanged.

## Required Supabase dashboard config (can't be done via code)

Go to **Authentication → URL Configuration** in your Supabase project and
set:

- **Site URL:** `https://getstrail.me`
- **Redirect URLs:** add `https://getstrail.me/auth/callback` (and
  `http://localhost:3000/auth/callback` for local dev)

This is what makes email-confirmation and password-reset links land on the
new `/auth/callback` route instead of your bare domain root.

## GA4 — this is the actual fix for your original problem

- `src/lib/analytics.ts` now exports `usePageTracking()`, mounted once in
  `App.tsx`. It fires a real `page_view` off `useLocation()` on every
  route change — no more manually calling `trackPageView` from a dozen
  different state-change effects.
- Authenticated (non-guest) users now get a stable GA4 `user_id` set via
  `setGaUserId()` in `appContext.tsx`, so you can track a person's usage
  across sessions/devices — this is the correct replacement for the
  Supabase-URL-code idea from earlier, which is an auth mechanism, not a
  tracking one.
- `index.html`'s `gtag('config', ..., { send_page_view: false })` should
  stay as-is — you still want manual control since not every route change
  is a meaningful "page" (e.g. modal opens), and `usePageTracking` already
  covers real navigations.

## Known simplification vs. the original

The original had a special minimal header (no nav tabs) for the very first
"you're onboarded but have no plan yet" screen. In the new version,
`/app/setup` always renders inside the full `AppLayout` (with nav tabs
visible). Functionally nothing breaks — `JourneyPage` still redirects to
`/app/setup` when there's no active plan — it's just a cosmetic difference
on that one first-run screen. Flagging it since it wasn't something you
explicitly asked to change.

## Files in this archive

**New:**
`src/lib/appContext.tsx`, `src/routes/guards.tsx`,
`src/pages/{LandingPageRoute,AuthPage,AuthCallbackPage,GuestPage,
OnboardingPage,AppLayout,JourneyPage,DashboardPage,SetupPage,
PublicJourneysGalleryPage,PublicJourneyDetailPage,ResetPasswordPage,
NotFoundPage,PrivacyPage,TermsPage}.tsx`

**Modified (full replacements):**
`package.json`, `vercel.json`, `src/main.tsx`, `src/App.tsx`,
`src/lib/analytics.ts`, `src/lib/supabase/queries.ts`,
`src/components/LandingPage.tsx`

**Delete:**
`src/components/PublicJourneys.tsx`

All 21 new/changed `.ts`/`.tsx` files were run through `esbuild` for a
syntax check (parses clean) — I don't have your actual `node_modules`
installed in this session, so a full `tsc --noEmit` against your real
dependency tree hasn't been run. Run `npm run lint` after applying the
patch to confirm.
