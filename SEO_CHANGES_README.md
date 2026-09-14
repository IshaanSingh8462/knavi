# Strail — SEO changes (accurate as of this patch)

The previous version of this file described meta description, canonical,
OG/Twitter tags, and JSON-LD as already added to `index.html`. They
weren't — an audit of the actual repo found none of that in the real file.
This version replaces that one and reflects only what's actually true.

## Applied in this patch

- `index.html` — added `<title>`, meta description, `<meta name="robots">`,
  canonical tag, Open Graph tags, Twitter Card tags, and two JSON-LD blocks
  (`WebApplication` + `WebSite`). No `og:image` yet — no real 1200×630
  asset exists in `/public`, and using the square app icon would look
  distorted as a social preview. Add one and wire it in when it exists.
- `index.html` / `src/index.css` — Google Fonts moved from a CSS `@import`
  to real `<link rel="preconnect">` + `<link rel="stylesheet">` tags in
  `<head>`, so the browser can start those requests earlier.
- `public/robots.txt` — added `Disallow` rules for `/app/`, `/onboarding`,
  `/guest`, `/auth/callback`, `/reset-password`. These are real routes now
  (post routing-migration) and none of them are content pages — `/guest`
  in particular creates a real anonymous auth session on load, so letting
  bots hit it repeatedly isn't just wasted crawl budget.
- `public/sitemap.xml` — added `/journeys`, `/privacy`, `/terms`.
  **Individual `/journeys/:taskId` URLs are NOT included** — the sitemap is
  a static file and the set of published journeys changes at runtime.
  Generating those correctly needs a dynamic sitemap (build-time script or
  a server endpoint that queries Supabase for `is_public = true` tasks),
  which wasn't implemented here.
- **Canonical host decision:** the site's actual live redirect sends
  `getstrail.me` → `www.getstrail.me` (verified by fetching it directly).
  Every URL in this patch (`robots.txt`, `sitemap.xml`, the canonical tag,
  JSON-LD) was updated to use `www.getstrail.me` to match that, since
  changing the two static files is far easier than changing the DNS/hosting
  redirect direction. If you'd actually rather the non-www version be
  canonical, that's a Vercel domain-settings change, not a code change —
  do that first, then flip these files back.
- `src/components/LandingPage.tsx` — added one plain-language sentence
  under the existing hero paragraph: "Strail is a task breakdown tool that
  helps students turn assignments, goals, and commitments into small,
  manageable steps." Nothing else in the hero changed.
- `src/lib/useDocumentMeta.ts` (new) — lightweight per-route
  `document.title`/meta-description updater, wired into the Public
  Journeys gallery, individual journey pages, Privacy, and Terms. Read the
  comment in that file for what this does and doesn't fix — it does NOT
  fix social-share link previews, since those read the static tags in
  `index.html` before any JS runs.

## Explicitly NOT done in this patch (needs a separate decision/session)

- **SSR / prerendering.** This is the biggest remaining item. The site is
  a pure client-rendered SPA — fetching the live homepage with no
  JavaScript execution returns only a `<title>` and viewport tag, no body
  content. Google/Bing render JS eventually and will likely see the real
  content with a delay; many AI-search crawlers are less likely to. Fixing
  this properly (so raw HTML already contains real content, including
  per-journey titles/descriptions for actual social previews) needs
  SSR or a build-time prerender step — a real architecture decision, not a
  file swap.
- **Vercel Deployment Protection check.** Can't be verified from source —
  check Vercel Dashboard → Project Settings → Deployment Protection to
  confirm production isn't accidentally gated behind auth or injecting an
  `X-Robots-Tag: noindex` header.
- **Dynamic sitemap generation** for individual public journeys (see
  above).
