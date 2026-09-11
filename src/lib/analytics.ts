// Lightweight GA4 wrapper. This app is a single-URL Vite SPA with no
// router, so "page views" here are logical screen changes we fire
// manually — not real browser navigations. Safe to call before gtag.js
// has finished loading; everything just queues onto window.dataLayer,
// which gtag drains once ready.

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

/**
 * Fires a GA4 virtual page_view for a logical "screen" of the app.
 * Call this whenever showLanding / auth mode / currentView changes.
 */
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
