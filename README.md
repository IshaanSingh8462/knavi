# Strail — scroll fix + real Privacy/Terms pages

6 files, all full replacements — copy into your repo at the matching paths.

## New files
- `src/lib/scrollManager.ts` — remembers each route's scroll position and
  restores it on return, instead of always resetting to the top.
- `src/components/SiteFooter.tsx` — the footer extracted out of
  `LandingPage.tsx` into its own reusable component, now also used on
  Privacy/Terms so those pages don't dead-end.

## Modified files
- `src/App.tsx` — mounts the new scroll manager.
- `src/components/LandingPage.tsx` — uses `<SiteFooter />` instead of its
  own inline footer; handles being navigated to with a specific section to
  scroll to (see below).
- `src/pages/PrivacyPage.tsx`, `src/pages/TermsPage.tsx` — real content
  (see the note at the top of each file — **you still need to fill in the
  contact email and governing-law state, marked with `[brackets]`**),
  restyled to match the app, with `<SiteFooter />` at the bottom.

## What was actually broken, and how this fixes it

**The scroll-to-top problem.** This app uses plain `BrowserRouter`, which
doesn't restore scroll position on navigation at all by default — going
back to `/` from `/privacy` always landed at the very top, even if you'd
been scrolled down to the footer. `scrollManager.ts` now remembers scroll
position per path (in memory, for the tab's lifetime) and restores it on
return, whether via the browser's back button or a normal link click.

**The dead-end pages problem.** Privacy and Terms were bare pages with
just a "Back to Strail" link — no footer, no way to get anywhere else
without going all the way back. They now render the same `SiteFooter` as
the homepage, so from either legal page you can jump straight to
`/journeys`, back to a specific landing-page section, etc.

**One wrinkle this created, and how it's handled:** the footer's
"About" / "Features" / etc. links only make sense as in-page scrolls when
you're already on the landing page. Clicking one from `/privacy` now
navigates to `/` and passes along *which* section to land on via router
state; `LandingPage.tsx` reads that on mount and scrolls there once, then
clears it. The new scroll-manager explicitly steps aside when it sees that
state, so the two don't fight over where the page ends up.

## Content note

The Privacy Policy and Terms text is real, substantive draft copy grounded
in what Strail actually does — Supabase auth, the Gemini API call for
generating trail steps, GA4 analytics, guest/anonymous mode, Public
Journeys sharing, even the actual 10-request/day AI rate limit from your
`schema.sql`. It is **not legal advice** and hasn't been reviewed by a
lawyer — given your users skew toward students, some of whom are minors,
that's worth having someone actually check before you treat it as final.
