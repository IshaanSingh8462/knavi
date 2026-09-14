import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';

// In-memory only (resets on a hard reload) — keyed by pathname, shared
// across the whole app for the lifetime of the tab.
const scrollPositions = new Map<string, number>();

/**
 * Mount once near the root of the routed tree (alongside usePageTracking).
 *
 * Without this, react-router (in the plain BrowserRouter setup this app
 * uses) doesn't restore scroll position on navigation at all — going back
 * to "/" from /privacy or /terms always lands at the very top, even if you
 * were scrolled down to the footer when you clicked away. This remembers
 * where you were on each path and restores it, whether you get there via
 * the browser's back button or a normal link click (e.g. the footer's
 * "Back to Strail" / logo link).
 *
 * A path visited for the first time in this tab still starts at the top,
 * same as normal page-load behavior — nothing changes for a fresh visit.
 *
 * Exception: if the navigation carries `state.scrollTo` (used by
 * SiteFooter's About/Features/etc links when clicked from off the landing
 * page), this hook steps aside and lets that page scroll itself to the
 * requested section instead of fighting over the scroll position.
 */
export function useScrollManager() {
  const location = useLocation();
  const pathRef = useRef(location.pathname);

  // Continuously record scroll position for whichever path is currently
  // mounted, so it's accurate the moment the user navigates away.
  useEffect(() => {
    pathRef.current = location.pathname;
    const handleScroll = () => {
      scrollPositions.set(pathRef.current, window.scrollY);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [location.pathname]);

  // Restore (or reset) scroll position whenever the route changes.
  useEffect(() => {
    if ((location.state as any)?.scrollTo) return;

    const saved = scrollPositions.get(location.pathname);
    const frame = window.requestAnimationFrame(() => {
      window.scrollTo(0, saved ?? 0);
    });
    return () => window.cancelAnimationFrame(frame);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);
}
