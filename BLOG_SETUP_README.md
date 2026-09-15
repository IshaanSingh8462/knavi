# Strail — Blog Section

Adds a blog to Strail as a real, separately-indexable part of the site
(`/blog` and `/blog/<slug>`), built for SEO reach toward students
searching things like "task paralysis" or "how to break down a big
assignment." Everything here fits your existing stack — no CMS, no new
backend, no SSR added.

## Where each file goes

Copy each file into your project at the same relative path, overwriting
where one already exists:

```
package.json                                → replaces (adds react-router-dom + a sitemap build step)
vercel.json                                 → replaces (adds SPA fallback so /blog/<slug> works on Vercel)
src/main.tsx                                → replaces (adds routing)
src/components/LandingPage.tsx              → replaces (adds a "Blog" link to the nav + footer)
src/content/blogPosts.ts                    → new (this is the file you edit to publish posts)
src/components/blog/SEOHead.tsx             → new
src/components/blog/BlogNav.tsx             → new
src/components/blog/BlogFooter.tsx          → new
src/components/blog/PostCard.tsx            → new
src/components/blog/BlogListPage.tsx        → new
src/components/blog/BlogPostPage.tsx        → new
scripts/generate-sitemap.ts                 → new
public/sitemap.xml                          → replaces (regenerated automatically on every build from here on)
```

After copying, run `npm install` (this pulls in `react-router-dom`, the
only new dependency).

## How to publish a new post

Open `src/content/blogPosts.ts` and add one object to the `blogPosts`
array:

```ts
{
  slug: 'my-new-post',                 // becomes /blog/my-new-post
  title: 'My New Post',
  excerpt: 'One or two sentences — used on the card and in previews.',
  date: '2026-09-14',
  author: 'The Strail Team',
  tags: ['study skills'],
  banner: { src: '/blog-images/my-new-post/banner.jpg', alt: '...' },
  midImage: { src: '/blog-images/my-new-post/mid.jpg', alt: '...', caption: 'optional' },
  paragraphs: [
    'First paragraph.',
    'Second paragraph.',
    // ...
  ],
}
```

Then drop the actual image files in
`public/blog-images/my-new-post/banner.jpg` and `.../mid.jpg`. That's the
entire workflow — nothing else needs to change. The blog list page, the
post page, and `sitemap.xml` (on your next `npm run build`) all read from
this one array.

`midImage` is optional — omit it for a post that's just text.

If an image path is missing or 404s, it's hidden gracefully rather than
showing a broken-image icon, so you can write the post before the image
is ready.

## Why real routing was added

The app was previously a single-URL SPA (see the comments already in
`analytics.ts` and `index.html`) — fine for the product, but a blog
without real URLs gets almost none of the SEO value: nothing distinct for
Google to index, no clean links to share, no per-post previews on social.
`react-router-dom` was added with exactly two new routes (`/blog`,
`/blog/:slug`); everything else, including all your existing auth/app
logic in `App.tsx`, is completely unchanged and now simply renders on the
catch-all route (`*`). The blog routes don't require Supabase or auth at
all, so they load fine even if a visitor never signs in.

## Per-post SEO

Since there's no server-side rendering, each blog page patches
`document.title`, the meta description, canonical URL, Open Graph /
Twitter tags, and `BlogPosting` JSON-LD structured data on mount (see
`SEOHead.tsx`) — so each post gets its own search snippet and social
preview instead of all sharing the homepage's.

## Sitemap

`scripts/generate-sitemap.ts` reads the same `blogPosts` array and
rewrites `public/sitemap.xml` automatically as part of `npm run build`
(and `npm run build:selfhost`). You never need to hand-edit the sitemap
when you add a post — just run a build (or `npm run generate-sitemap` on
its own) before deploying.

## Design

The blog reuses Strail's existing marketing palette (the `--color-lp-*`
tokens already in `index.css`) and the same logo/typography as the
landing page, rather than introducing a separate visual system — so it
reads as one site, not a bolted-on blog.

## Not included (flagging, not forgotten)

- Real image assets — the three seed posts point at placeholder paths
  under `/blog-images/...` that don't exist yet; add real files there.
- RSS feed — straightforward to add later off the same `blogPosts` array
  if you want it.
- Tag filtering / search on the blog index — the `tags` field is stored
  and displayed per post but not yet used to filter the list.
