import { useEffect, useRef } from 'react';
import { trackEvent } from './analytics';

const THRESHOLDS = [25, 50, 75, 100];

/**
 * Fires a GA4 'scroll_depth' event the first time the window crosses each
 * of 25/50/75/100% scroll on the page this is mounted in. `sectionName`
 * is attached to every event so it's filterable in GA4 reports.
 */
export function useScrollDepthTracking(sectionName: string, enabled = true) {
  const firedRef = useRef<Set<number>>(new Set());

  useEffect(() => {
    if (!enabled) return;
    firedRef.current = new Set();

    const onScroll = () => {
      const doc = document.documentElement;
      const scrollTop = window.scrollY || doc.scrollTop;
      const scrollHeight = doc.scrollHeight - doc.clientHeight;
      if (scrollHeight <= 0) return;
      const pct = Math.round((scrollTop / scrollHeight) * 100);

      for (const threshold of THRESHOLDS) {
        if (pct >= threshold && !firedRef.current.has(threshold)) {
          firedRef.current.add(threshold);
          trackEvent('scroll_depth', {
            section: sectionName,
            percent_scrolled: threshold,
          });
        }
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll(); // in case the page loads already scrolled (e.g. back-nav)
    return () => window.removeEventListener('scroll', onScroll);
  }, [sectionName, enabled]);
}
