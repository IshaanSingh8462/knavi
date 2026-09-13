import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';

// GA4 wrapper. Now that the app has real routes (react-router), page views
// fire automatically off actual URL changes instead of being manually
// dispatched from component state — see usePageTracking() below, mounted
// once near the root of the routed app. trackPageView/trackEvent are kept
// as-is so nothing else that already calls them needs to change.

declare global {
  interface Window {
    dataLayer: any[];
    gtag?: (...args: any[]) => void;
  }
}

function pushToDataLayer(...args: any[]) {
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push(args);
}

/** Fires a GA4 page_view for the given path/title. Called automatically by
 *  usePageTracking() on every route change — most code should not need to
 *  call this directly anymore. */
export function trackPageView(pagePath: string, pageTitle: string) {
  pushToDataLayer('event', 'page_view', {
    page_path: pagePath,
    page_title: pageTitle,
    page_location: `${window.location.origin}${pagePath}`,
  });
}

/** Fires an arbitrary GA4 custom event. */
export function trackEvent(eventName: string, params: Record<string, any> = {}) {
  pushToDataLayer('event', eventName, params);
}

/** Attaches (or clears) a stable GA4 user_id for cross-session tracking of
 *  authenticated, non-guest users. Pass null to clear it on sign-out. */
export function setGaUserId(userId: string | null) {
  pushToDataLayer('set', userId ? { user_id: userId } : { user_id: undefined });
}

// Maps a pathname to a human-readable title for GA4's page_title dimension.
// Falls back to the raw path for anything not explicitly named (e.g.
// dynamic /journeys/:id routes still get a sensible generic title).
function titleForPath(pathname: string): string {
  if (pathname === '/') return 'Landing';
  if (pathname === '/guest') return 'Guest Entry';
  if (pathname === '/login') return 'Sign In';
  if (pathname === '/signup') return 'Account Creation';
  if (pathname === '/auth/callback') return 'Auth Callback';
  if (pathname === '/onboarding') return 'Onboarding';
  if (pathname === '/reset-password') return 'Reset Password';
  if (pathname === '/privacy') return 'Privacy Policy';
  if (pathname === '/terms') return 'Terms & Conditions';
  if (pathname === '/journeys') return 'Public Journeys Gallery';
  if (pathname.startsWith('/journeys/')) return 'Public Journey Detail';
  if (pathname === '/app' || pathname === '/app/') return 'Daily Trail';
  if (pathname === '/app/dashboard') return 'Standings';
  if (pathname === '/app/setup') return 'Weekly Setup';
  return pathname;
}

/** Mount once near the root of the routed tree. Fires a GA4 page_view on
 *  every real navigation (path OR query change), replacing the old manual
 *  virtual-pageview effect that lived in App.tsx. */
export function usePageTracking() {
  const location = useLocation();
  const lastTracked = useRef<string | null>(null);

  useEffect(() => {
    const key = location.pathname + location.search;
    if (lastTracked.current === key) return;
    lastTracked.current = key;
    trackPageView(key, titleForPath(location.pathname));
  }, [location.pathname, location.search]);
}
