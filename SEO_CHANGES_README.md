# Strail — SEO Foundation Changes

This package contains the SEO changes for the Strail marketing site (Vite +
React SPA, no router/SSR). Everything here fits inside the current
architecture — no routing, prerendering, SSR, or SSG was added.

## Where each file goes in your repo

Copy each file into your project at the **same relative path** shown below,
overwriting the existing file:

```
index.html                          → replaces your existing index.html
public/robots.txt                   → new file
public/sitemap.xml                  → new file
src/components/LandingPage.tsx      → replaces your existing LandingPage.tsx
```

No other files need to change, and nothing needs to be installed —
these are drop-in replacements/additions.

---

## 1. `index.html` (modified)

Added, with no duplicate or conflicting tags:

- `<title>Strail — AI Task Breakdown for Students</title>`
- Meta description (132 characters):
  > "Strail is an AI-powered task breakdown tool that turns overwhelming
  > assignments and goals into small, actionable steps for students."
- `<link rel="canonical" href="https://getstrail.me/">`
- `<meta name="robots" content="index, follow">`
- Open Graph tags: `og:type`, `og:site_name`, `og:title`, `og:description`,
  `og:url`, `og:locale`
- Twitter Card tags: `twitter:card` (`summary`), `twitter:title`,
  `twitter:description`
- `SoftwareApplication` JSON-LD structured data (no invented ratings,
  reviews, prices, or user counts)

Left untouched: your existing favicon link (`/strail-logo.png`) and the
Google Analytics (`gtag.js`) snippet.

**Not included:** `og:image` / `twitter:image`. The only image asset in
`public/` right now is the square app icon, not a proper 1200×630 social
preview image. Add one and I can wire it in — using the app icon as an OG
image would look distorted/cropped when shared on social platforms.

## 2. `public/robots.txt` (new)

```
User-agent: *
Allow: /

Sitemap: https://getstrail.me/sitemap.xml
```

Allows full crawling, points crawlers at the sitemap.

## 3. `public/sitemap.xml` (new)

```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://getstrail.me/</loc>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
</urlset>
```

Uses the correct `sitemaps.org` namespace (not `sitemap.org` — a common
typo). Only lists the homepage, since the app has no router yet and
therefore no other public, indexable URLs.

## 4. `src/components/LandingPage.tsx` (modified)

- **H1 unchanged**: still "Turn big goals into small, walkable steps."
- **One sentence added** directly under the existing hero paragraph, styled
  small and muted so it doesn't compete with your existing copy:

  > "Strail is an AI-powered task breakdown tool that helps students turn
  > overwhelming assignments and goals into simple, actionable steps."

  This is real, visible HTML text (not `sr-only` or `aria-hidden`), so it
  reads naturally for visitors and is crawlable by search engines.
- No other content, layout, styling, or functionality was changed.

---

## Semantic/accessibility audit (no changes needed)

Already correct in the existing code, confirmed during this pass:

- Exactly one `<h1>` on the page; heading hierarchy (`h2`/`h3`) is logical
- `<header>`, `<nav>`, `<main>`, `<section>`, `<footer>` already used
  correctly
- Images already have meaningful alt text; decorative SVGs already use
  `aria-hidden="true"`
- No `noindex` directives, no `localhost` URLs, no old-domain references
  found anywhere in the metadata

## Validation performed

- `sitemap.xml` parsed as valid XML with the correct namespace
- `robots.txt` checked for required directives and no blanket `Disallow`
- `index.html` checked for exactly one of each SEO tag (title, description,
  canonical, robots, each OG/Twitter property, JSON-LD block) — no
  duplicates or conflicts
- `LandingPage.tsx` — exactly one `<h1>`, new sentence confirmed as plain
  visible text, syntax-checked with esbuild, and type-checked with
  `tsc --noEmit` against the project's actual pinned dependencies (React 19,
  `lucide-react@0.546.0`) — zero errors

**Not run:** a full `npm run build` against your live repository (this
session only had the pasted file contents, not a working checkout). Run it
once locally after applying these files — nothing here should break it, but
it's worth confirming before deploying.

## Deferred (per your instructions — not implemented here)

- `/task-breakdown` page — needs a routing/prerendering decision first
- `og:image` / `twitter:image` — needs a real social-preview asset
- Title templating (`%s | Strail`) — not meaningful until there's more than
  one public URL
