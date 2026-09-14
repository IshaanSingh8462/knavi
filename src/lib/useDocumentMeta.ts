import { useEffect } from 'react';

interface DocumentMetaOptions {
  title: string;
  description?: string;
}

// Keep these in sync with the defaults in index.html's <title> and
// <meta name="description"> — this is what gets restored when a page
// using useDocumentMeta() unmounts.
export const DEFAULT_TITLE = 'Strail — Task Breakdown for Students';
export const DEFAULT_DESCRIPTION =
  "Strail is an AI-powered task breakdown tool that turns students' goals, assignments, and commitments into small, manageable steps.";

function setMetaDescription(content: string) {
  let tag = document.querySelector('meta[name="description"]');
  if (!tag) {
    tag = document.createElement('meta');
    tag.setAttribute('name', 'description');
    document.head.appendChild(tag);
  }
  tag.setAttribute('content', content);
}

/**
 * Sets document.title and the meta description for as long as the calling
 * page is mounted, restoring the site-wide defaults on unmount.
 *
 * IMPORTANT — what this does and doesn't fix: this is a lightweight,
 * dependency-free stand-in for a real head-management library (like
 * react-helmet). It updates the *live DOM* after JavaScript has run, which
 * helps the browser tab title, browser history entries, and any crawler
 * that actually executes JS and re-reads the DOM (Google/Bing eventually
 * do this). It does NOT change what's in the raw HTML response for a given
 * URL — that's still whatever's in index.html, generated once, the same
 * for every route. So it does nothing for crawlers/link-preview bots that
 * only fetch raw HTML without running JS, and social share previews for
 * individual /journeys/:taskId links will still show the site-wide
 * og:title/og:description from index.html, not the per-journey ones. Truly
 * fixing that requires SSR or build-time prerendering per route — this is
 * a partial improvement in the meantime, not a replacement for that.
 */
export function useDocumentMeta({ title, description }: DocumentMetaOptions) {
  useEffect(() => {
    const previousTitle = document.title;
    document.title = title;
    if (description) setMetaDescription(description);

    return () => {
      document.title = previousTitle;
      setMetaDescription(DEFAULT_DESCRIPTION);
    };
  }, [title, description]);
}
