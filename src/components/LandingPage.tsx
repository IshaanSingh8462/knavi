import { useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowRight,
  Lock,
  Check,
  Instagram,
  Sparkles,
  CalendarClock,
  Compass,
  Flame,
} from 'lucide-react';
import strailLogo from '../assets/strail-logo.png';

interface LandingPageProps {
  onSignIn: () => void;          // opens login mode on the auth card
  onSignUp: () => void;          // opens signup mode on the auth card
  onGuest: () => void;           // triggers guest entry
  isGuestSubmitting?: boolean;   // reflects App.tsx's guest-auth in-flight state
}

const SECTIONS = [
  { id: 'top', label: 'Basecamp' },
  { id: 'about', label: 'About' },
  { id: 'how-it-works', label: 'How It Works' },
  { id: 'features', label: 'Features' },
  { id: 'journeys', label: 'Journeys' },
];

/** Small circular node-state badge — mirrors the real app's node language
 *  (locked / active / done) so the marketing page never invents a visual
 *  vocabulary the product doesn't already use. */
function NodeBadge({ state, size = 40, ring = false }: { state: 'done' | 'active' | 'locked'; size?: number; ring?: boolean }) {
  const fill = state === 'done' ? 'var(--color-lp-trail-600)' : state === 'active' ? 'var(--color-lp-gold-600)' : 'var(--color-lp-bark-300)';
  return (
    <span className="relative grid place-items-center shrink-0" style={{ width: size, height: size }}>
      {ring && (
        <span
          className="absolute rounded-full border-2 animate-ping"
          style={{ inset: -6, borderColor: 'var(--color-lp-gold-600)', animationDuration: '2.4s' }}
        />
      )}
      <span
        className="relative grid place-items-center rounded-full shadow-[0_2px_0_rgba(0,0,0,0.15)]"
        style={{ width: size, height: size, backgroundColor: fill }}
      >
        {state === 'done' && <Check className="text-white" style={{ width: size * 0.5, height: size * 0.5 }} />}
        {state === 'locked' && <Lock className="text-white" style={{ width: size * 0.4, height: size * 0.4 }} />}
      </span>
    </span>
  );
}

/** Left-edge scroll progress rail — sections behind you read "done," the
 *  current one pulses "active," sections ahead read "locked." */
function SideTrailNav({ activeIndex, onJump }: { activeIndex: number; onJump: (id: string) => void }) {
  return (
    <div className="hidden lg:flex flex-col fixed left-6 top-1/2 -translate-y-1/2 z-40">
      {SECTIONS.map((s, i) => {
        const state: 'done' | 'active' | 'locked' = i < activeIndex ? 'done' : i === activeIndex ? 'active' : 'locked';
        return (
          <div key={s.id} className="flex flex-col items-center">
            <button
              type="button"
              onClick={() => onJump(s.id)}
              aria-label={s.label}
              className="group relative flex items-center cursor-pointer"
            >
              <div
                className={`relative rounded-full grid place-items-center shrink-0 transition-transform ${
                  state === 'locked' ? 'w-9 h-9 border-2 border-dashed' : 'w-11 h-11 border-[3px]'
                } ${state === 'active' ? 'scale-110' : ''}`}
                style={{
                  borderColor: state === 'locked' ? 'var(--color-lp-bark-300)' : state === 'active' ? 'var(--color-lp-gold-600)' : 'var(--color-lp-trail-600)',
                  backgroundColor: state === 'locked' ? 'var(--color-lp-cream-paper)' : state === 'active' ? 'var(--color-lp-gold-400)' : 'var(--color-lp-trail-300)',
                }}
              >
                {state === 'locked' ? (
                  <Lock className="w-3.5 h-3.5" style={{ color: 'var(--color-lp-ink-soft)' }} />
                ) : state === 'done' ? (
                  <Check className="w-4 h-4" style={{ color: 'var(--color-lp-forest-950)' }} />
                ) : (
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: 'var(--color-lp-forest-950)' }} />
                )}
              </div>
              <span
                className={`ml-3 text-[11px] font-mono uppercase tracking-widest whitespace-nowrap transition-opacity ${
                  state === 'active' ? 'opacity-100 font-bold' : 'opacity-0 group-hover:opacity-100'
                }`}
                style={{ color: 'var(--color-lp-ink)' }}
              >
                {s.label}
              </span>
            </button>
            {i < SECTIONS.length - 1 && <div className="w-[3px] h-8" style={{ backgroundColor: 'var(--color-lp-gold-600)', opacity: 0.4 }} />}
          </div>
        );
      })}
    </div>
  );
}

const NAV_LINKS = [
  { label: 'About', href: 'about' },
  { label: 'How it works', href: 'how-it-works' },
  { label: 'Features', href: 'features' },
  { label: 'Journeys', href: 'journeys' },
];

function Header({ onJump, onSignUp }: { onJump: (id: string) => void; onSignUp: () => void }) {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 inset-x-0 z-50 transition-colors duration-300 ${
        scrolled ? 'backdrop-blur-sm border-b' : 'border-b border-transparent'
      }`}
      style={{
        backgroundColor: scrolled ? 'rgba(247,241,225,0.9)' : 'transparent',
        borderColor: scrolled ? 'rgba(185,143,75,0.2)' : 'transparent',
      }}
    >
      <nav className="mx-auto max-w-6xl px-5 sm:px-8 h-16 flex items-center justify-between">
        <button type="button" onClick={() => onJump('top')} className="flex items-center gap-2.5 shrink-0 cursor-pointer">
          <span className="grid place-items-center w-11 h-11 rounded-lg p-1.5" style={{ backgroundColor: 'var(--color-lp-forest-950)' }}>
            <img src={strailLogo} alt="Strail" className="w-full h-full object-contain" />
          </span>
          <span className="font-display font-bold text-lg tracking-tight" style={{ color: 'var(--color-lp-ink)' }}>
            Strail
          </span>
        </button>

        <ul className="hidden md:flex items-center gap-8 font-body text-[15px]" style={{ color: 'var(--color-lp-ink-soft)' }}>
          {NAV_LINKS.map((l) => (
            <li key={l.href}>
              <button type="button" onClick={() => onJump(l.href)} className="hover:opacity-70 transition-opacity cursor-pointer">
                {l.label}
              </button>
            </li>
          ))}
        </ul>

        <div className="hidden md:flex items-center gap-3">
          <button
            type="button"
            onClick={onSignUp}
            className="inline-flex items-center gap-1.5 rounded-full px-5 py-2.5 font-body font-semibold text-sm text-white hover:-translate-y-0.5 transition-all cursor-pointer"
            style={{ backgroundColor: 'var(--color-lp-trail-600)' }}
          >
            Start your trail
          </button>
        </div>

        <button
          type="button"
          className="md:hidden grid place-items-center w-11 h-11 rounded-lg border cursor-pointer"
          style={{ borderColor: 'rgba(27,27,22,0.15)', color: 'var(--color-lp-ink)' }}
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((v) => !v)}
        >
          {menuOpen ? (
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M2 2L16 16M16 2L2 16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></svg>
          ) : (
            <svg width="18" height="14" viewBox="0 0 18 14" fill="none"><path d="M0 1H18M0 7H18M0 13H18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></svg>
          )}
        </button>
      </nav>

      {menuOpen && (
        <div className="md:hidden border-b px-5 pb-6 pt-2" style={{ backgroundColor: 'var(--color-lp-cream)', borderColor: 'rgba(185,143,75,0.2)' }}>
          <ul className="flex flex-col gap-1 font-body text-[15px]" style={{ color: 'var(--color-lp-ink)' }}>
            {NAV_LINKS.map((l) => (
              <li key={l.href} className="border-b" style={{ borderColor: 'rgba(27,27,22,0.05)' }}>
                <button type="button" onClick={() => { onJump(l.href); setMenuOpen(false); }} className="block w-full text-left py-3 cursor-pointer">
                  {l.label}
                </button>
              </li>
            ))}
          </ul>
          <button
            type="button"
            onClick={() => { onSignUp(); setMenuOpen(false); }}
            className="mt-4 inline-flex w-full items-center justify-center gap-1.5 rounded-full text-white px-5 py-3 font-body font-semibold text-sm cursor-pointer"
            style={{ backgroundColor: 'var(--color-lp-trail-600)' }}
          >
            Start your trail
          </button>
        </div>
      )}
    </header>
  );
}

function Hero({ onSignUp, onSignIn, onGuest, isGuestSubmitting }: LandingPageProps) {
  return (
    <section id="top" className="relative overflow-hidden pt-32 pb-20 sm:pt-40 sm:pb-28" style={{ backgroundColor: 'var(--color-lp-cream)' }}>
      <svg className="absolute inset-x-0 bottom-0 w-full h-[140px] sm:h-[200px]" viewBox="0 0 1440 200" preserveAspectRatio="none" aria-hidden="true">
        <path d="M0 140 C 180 90, 340 170, 520 120 S 860 60, 1040 130 S 1300 100, 1440 140 V200 H0 Z" fill="var(--color-lp-trail-100)" />
      </svg>

      <div className="relative mx-auto max-w-6xl px-5 sm:px-8 grid lg:grid-cols-[1.15fr_0.85fr] gap-14 lg:gap-8 items-center">
        <div>
          <span
            className="inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 font-mono text-[11px] tracking-widest uppercase"
            style={{ borderColor: 'rgba(168,130,90,0.4)', backgroundColor: 'var(--color-lp-cream-paper)', color: 'var(--color-lp-bark-500)' }}
          >
            <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: 'var(--color-lp-trail-600)' }} />
            For students doing too much
          </span>

          <h1
            className="mt-6 font-display font-extrabold text-[2.6rem] leading-[1.06] tracking-tight sm:text-[3.4rem] lg:text-[3.75rem]"
            style={{ color: 'var(--color-lp-ink)' }}
          >
            Turn big goals into
            <br className="hidden sm:block" /> small, walkable steps.
          </h1>

          <p className="mt-6 max-w-md font-body text-lg leading-relaxed" style={{ color: 'var(--color-lp-ink-soft)' }}>
            Strail breaks your goals, classes, and commitments into a trail of small steps — so overwhelm turns into a path you can actually walk, one node at a time.
          </p>

          <div className="mt-9 flex flex-wrap items-center gap-4">
            <button
              type="button"
              onClick={onSignUp}
              className="inline-flex items-center gap-2 rounded-full px-6 py-3.5 font-body font-semibold text-white shadow-[0_3px_0_#173722] hover:-translate-y-0.5 hover:shadow-[0_5px_0_#173722] transition-all cursor-pointer"
              style={{ backgroundColor: 'var(--color-lp-trail-600)' }}
            >
              Start your trail
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={onSignIn}
              className="font-body font-semibold border-b-2 pb-1 hover:opacity-70 transition-opacity cursor-pointer"
              style={{ color: 'var(--color-lp-ink)', borderColor: 'var(--color-lp-gold-600)' }}
            >
              Sign in
            </button>
            <button
              type="button"
              onClick={onGuest}
              disabled={isGuestSubmitting}
              className={`font-body font-semibold text-sm underline transition-colors ${isGuestSubmitting ? 'cursor-not-allowed opacity-60' : 'cursor-pointer hover:opacity-70'}`}
              style={{ color: 'var(--color-lp-ink-soft)' }}
            >
              {isGuestSubmitting ? 'Entering...' : 'Browse as a guest'}
            </button>
          </div>

          <div className="mt-12 flex flex-wrap items-center gap-5 font-mono text-[11px] uppercase tracking-wider" style={{ color: 'var(--color-lp-ink-faint)' }}>
            <span>No mascots.</span>
            <span className="w-1 h-1 rounded-full" style={{ backgroundColor: 'var(--color-lp-ink-faint)', opacity: 0.5 }} />
            <span>No streak-shaming.</span>
            <span className="w-1 h-1 rounded-full" style={{ backgroundColor: 'var(--color-lp-ink-faint)', opacity: 0.5 }} />
            <span>Just a path.</span>
          </div>
        </div>

        <div className="relative mx-auto lg:mx-0">
          <div className="relative w-[280px] h-[280px] sm:w-[340px] sm:h-[340px]">
            <svg viewBox="0 0 340 340" className="absolute inset-0">
              <circle cx="170" cy="170" r="164" fill="var(--color-lp-gold-400)" opacity="0.5" />
              <path d="M170 24 A146 146 0 1 1 169.9 24" fill="none" stroke="var(--color-lp-gold-600)" strokeWidth="3" strokeDasharray="1 10" strokeLinecap="round" />
            </svg>
            <div
              className="absolute inset-[38px] rounded-full grid place-items-center p-10 shadow-[0_16px_40px_-12px_rgba(14,30,21,0.45)]"
              style={{ backgroundColor: 'var(--color-lp-forest-950)' }}
            >
              <img src={strailLogo} alt="Strail logo — a winding green path shaped like an S" className="w-full h-full object-contain" />
            </div>
            <div className="absolute -top-2 -right-2 sm:top-0 sm:right-0"><NodeBadge state="done" size={46} /></div>
            <div className="absolute bottom-8 -left-4 sm:bottom-10 sm:-left-6"><NodeBadge state="active" ring size={46} /></div>
            <div className="absolute -bottom-2 right-10 sm:right-14"><NodeBadge state="locked" size={38} /></div>
          </div>
        </div>
      </div>
    </section>
  );
}

const PROBLEM_TEXT =
  "Every student is carrying five things at once — classes, clubs, a job, applications, a life outside all of it. The advice is always the same: break it down. But nobody says how, or where to start, or what to do when the list keeps growing faster than you can cross things off.";

// Wheel/touch delta needed to reveal one more word once the section is pinned.
const PX_PER_WORD = 45;

/**
 * Scroll-locking word reveal. While this section is docked at the top of the
 * viewport and not yet fully revealed, wheel/touch input is captured and
 * converted into reveal progress instead of moving the page — so the
 * animation can never be scrolled past half-finished, and there's no dead
 * scroll runway left over afterwards (the section is exactly one viewport
 * tall; once revealed it releases the scroll and behaves like a normal
 * section).
 */
function ProblemStatement() {
  const sectionRef = useRef<HTMLElement>(null);
  const words = useMemo(() => PROBLEM_TEXT.split(' '), []);
  const [litCount, setLitCount] = useState(0);
  const [locked, setLocked] = useState(false);

  const progressRef = useRef(0); // fractional word progress, 0..words.length
  const lockedRef = useRef(false);
  const completedRef = useRef(false);
  const touchYRef = useRef<number | null>(null);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const applyDelta = (delta: number) => {
      progressRef.current = Math.min(words.length, Math.max(0, progressRef.current + delta / PX_PER_WORD));
      setLitCount(Math.round(progressRef.current));

      if (progressRef.current >= words.length) {
        completedRef.current = true;
        lockedRef.current = false;
        setLocked(false);
      } else if (progressRef.current <= 0 && delta < 0) {
        // Scrolled all the way back to the start — release so the user can
        // continue scrolling up into whatever comes before this section.
        lockedRef.current = false;
        setLocked(false);
      }
    };

    const tryEngage = (deltaY: number) => {
      if (completedRef.current || lockedRef.current) return lockedRef.current;
      const rect = section.getBoundingClientRect();
      const coveringViewport = rect.top <= 0 && rect.bottom > 0;
      if (deltaY > 0 && coveringViewport) {
        // Snap the section into perfect alignment with the top of the
        // viewport before pinning, so a fast flick that overshoots the
        // trigger point doesn't leave the section visibly offset.
        if (rect.top !== 0) window.scrollBy(0, rect.top);
        lockedRef.current = true;
        setLocked(true);
        return true;
      }
      return false;
    };

    const onWheel = (e: WheelEvent) => {
      if (completedRef.current) return;
      const engaged = lockedRef.current || tryEngage(e.deltaY);
      if (!engaged) return;
      e.preventDefault();
      applyDelta(e.deltaY);
    };

    const onTouchStart = (e: TouchEvent) => {
      touchYRef.current = e.touches[0]?.clientY ?? null;
    };

    const onTouchMove = (e: TouchEvent) => {
      if (touchYRef.current === null) return;
      const currentY = e.touches[0]?.clientY ?? touchYRef.current;
      const delta = touchYRef.current - currentY; // swipe up => positive => scroll down
      const engaged = lockedRef.current || tryEngage(delta);
      touchYRef.current = currentY;
      if (!engaged) return;
      e.preventDefault();
      applyDelta(delta);
    };

    // Keyboard scrolling (PageDown/Space/arrows) bypasses wheel/touch
    // entirely in most browsers, so it needs its own handler to respect
    // the same lock.
    const KEY_DELTA: Record<string, number> = {
      ArrowDown: PX_PER_WORD,
      PageDown: PX_PER_WORD * 3,
      ' ': PX_PER_WORD * 3,
      ArrowUp: -PX_PER_WORD,
      PageUp: -PX_PER_WORD * 3,
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (completedRef.current || !(e.key in KEY_DELTA)) return;
      const delta = KEY_DELTA[e.key];
      const engaged = lockedRef.current || tryEngage(delta);
      if (!engaged) return;
      e.preventDefault();
      applyDelta(delta);
    };

    window.addEventListener('wheel', onWheel, { passive: false });
    window.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('touchmove', onTouchMove, { passive: false });
    window.addEventListener('keydown', onKeyDown);
    return () => {
      window.removeEventListener('wheel', onWheel);
      window.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [words.length]);

  return (
    <section
      id="about"
      ref={sectionRef}
      className="relative h-screen flex flex-col justify-center px-5 sm:px-8 overflow-hidden"
      style={{ backgroundColor: 'var(--color-lp-cream-deep)' }}
    >
      <div className="mx-auto max-w-3xl w-full">
        <h2 className="sr-only">The problem Strail solves</h2>
        <span className="font-mono text-[11px] tracking-widest uppercase" style={{ color: 'var(--color-lp-bark-500)' }} aria-hidden="true">
          The problem
        </span>
        <p className="mt-6 font-display font-semibold text-[1.6rem] leading-snug sm:text-[2.15rem] sm:leading-snug">
          {words.map((w, i) => (
            <span key={i} className="transition-colors duration-200" style={{ color: i < litCount ? 'var(--color-lp-ink)' : 'rgba(140,135,112,0.33)' }}>
              {w}{' '}
            </span>
          ))}
        </p>
        <div className="mt-10 border-t pt-8" style={{ borderColor: 'rgba(168,130,90,0.3)' }}>
          <p className="font-display font-bold text-xl sm:text-2xl leading-snug max-w-xl" style={{ color: 'var(--color-lp-forest-700)' }}>
            Strail turns your goals into a path you can actually walk — one step, one node, at a time.
          </p>
        </div>
      </div>
      {locked && (
        <span className="absolute bottom-8 left-1/2 -translate-x-1/2 font-mono text-[10px] tracking-widest uppercase animate-pulse" style={{ color: 'var(--color-lp-bark-500)' }}>
          keep scrolling
        </span>
      )}
    </section>
  );
}

const HOW_STEPS = [
  { n: '01', title: 'Tell it your goal', body: "A class, a competition, a college app, a habit you keep dropping — say what you're aiming for, in your own words." },
  { n: '02', title: 'Strail lays the trail', body: 'It breaks the goal into small nodes sized for a single sitting, in an order that actually makes sense.' },
  { n: '03', title: 'You walk it, node by node', body: 'Finish one, the next lights up. No wall of tasks staring back at you — just the next right step.' },
  { n: '04', title: 'Your week protects itself', body: "Strail schedules nodes around the time you've already promised to practice, work, or rest." },
];

function HowItWorks() {
  return (
    <section id="how-it-works" className="relative py-24 sm:py-32" style={{ backgroundColor: 'var(--color-lp-cream-deep)' }}>
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <div className="max-w-xl">
          <span className="font-mono text-[11px] tracking-widest uppercase" style={{ color: 'var(--color-lp-bark-500)' }}>How it works</span>
          <h2 className="mt-4 font-display font-extrabold text-3xl sm:text-4xl leading-tight" style={{ color: 'var(--color-lp-ink)' }}>
            One node at a time, not one giant to-do list.
          </h2>
        </div>

        <div className="mt-16 grid lg:grid-cols-[0.95fr_1.05fr] gap-16 items-start">
          <ol className="space-y-10">
            {HOW_STEPS.map((s, i) => (
              <li key={s.n} className="relative pl-14">
                <span
                  className="absolute left-0 top-0 grid place-items-center w-10 h-10 rounded-full border font-mono text-xs"
                  style={{ backgroundColor: 'var(--color-lp-cream-paper)', borderColor: 'rgba(185,143,75,0.4)', color: 'var(--color-lp-bark-500)' }}
                >
                  {s.n}
                </span>
                {i < HOW_STEPS.length - 1 && (
                  <span className="absolute left-5 top-10 w-px h-[calc(100%+1.5rem)]" style={{ backgroundColor: 'rgba(185,143,75,0.3)' }} aria-hidden="true" />
                )}
                <h3 className="font-display font-bold text-lg" style={{ color: 'var(--color-lp-ink)' }}>{s.title}</h3>
                <p className="mt-1.5 font-body leading-relaxed" style={{ color: 'var(--color-lp-ink-soft)' }}>{s.body}</p>
              </li>
            ))}
          </ol>

          {/* Real product visual: a browser-style frame around a static
              preview of the app's own node language, instead of a fake
              screenshot — so this panel can never drift from the real UI. */}
          <div className="relative rounded-[28px] p-3 shadow-[0_24px_60px_-20px_rgba(14,30,21,0.5)]" style={{ backgroundColor: 'var(--color-lp-forest-950)' }}>
            <div className="rounded-[20px] overflow-hidden p-6 sm:p-8" style={{ backgroundColor: 'var(--color-lp-trail-100)' }}>
              <p className="font-mono text-[11px] tracking-widest uppercase mb-6" style={{ color: 'var(--color-lp-forest-700)' }}>
                🗺️ Research Paper Trail
              </p>
              <div className="space-y-5">
                {[
                  { label: 'Pick a Topic', state: 'done' as const },
                  { label: 'Gather Sources', state: 'done' as const },
                  { label: 'Build an Outline', state: 'active' as const },
                  { label: 'Write Introduction', state: 'locked' as const },
                  { label: 'Draft & Submit', state: 'locked' as const },
                ].map((n) => (
                  <div key={n.label} className="flex items-center gap-4">
                    <NodeBadge state={n.state} ring={n.state === 'active'} size={38} />
                    <span
                      className="font-body font-semibold text-[15px]"
                      style={{ color: n.state === 'locked' ? 'var(--color-lp-ink-faint)' : 'var(--color-lp-ink)' }}
                    >
                      {n.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

const FEATURES = [
  { icon: Sparkles, title: 'AI trail-building', body: "Describe a goal in plain language. Strail drafts the nodes, sizes each one to about 20 minutes, and orders them so nothing depends on a step you haven't done yet.", tag: 'Core', big: true },
  { icon: CalendarClock, title: 'Protected time', body: "Block off practice, work, and rest before your week fills up with everyone else's requests for your time.", tag: 'Weekly setup', big: false },
  { icon: Compass, title: 'Public journeys', body: 'Browse trails other students have walked — a robotics build season, a college app cycle — and fork one to fit your own goal.', tag: 'Community', big: false },
  { icon: Flame, title: "Streaks that don't guilt you", body: 'Miss a day and Strail reshuffles the trail instead of resetting your progress to zero.', tag: 'Dashboard', big: false },
];

function FeatureIllustration() {
  return (
    <svg viewBox="0 0 160 160" className="w-full h-full">
      <path d="M20 140 C 40 100, 20 80, 50 60 S 90 40, 90 20" fill="none" stroke="var(--color-lp-gold-600)" strokeWidth="4" strokeLinecap="round" strokeDasharray="0.1 12" />
      <circle cx="20" cy="140" r="9" fill="var(--color-lp-trail-600)" />
      <path d="M16 141l2.5 2.5L24 138" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <circle cx="90" cy="20" r="11" fill="var(--color-lp-bark-300)" />
      <path d="M91.5 13l-5 8h3.5l-1 6 5-8h-3.5l1-6z" fill="white" />
    </svg>
  );
}

function Features() {
  return (
    <section id="features" className="relative py-24 sm:py-32" style={{ backgroundColor: 'var(--color-lp-cream)' }}>
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6">
          <div className="max-w-lg">
            <span className="font-mono text-[11px] tracking-widest uppercase" style={{ color: 'var(--color-lp-bark-500)' }}>Features</span>
            <h2 className="mt-4 font-display font-extrabold text-3xl sm:text-4xl leading-tight" style={{ color: 'var(--color-lp-ink)' }}>
              Everything is in service of the next step.
            </h2>
          </div>
          <p className="max-w-xs font-body text-sm leading-relaxed" style={{ color: 'var(--color-lp-ink-soft)' }}>
            No leaderboards, no mascots, no notifications designed to make you anxious. Just the tools that get a goal from idea to done.
          </p>
        </div>

        <div className="mt-14 grid sm:grid-cols-2 gap-5">
          {FEATURES.map((f) => (
            <article
              key={f.title}
              className={`rounded-2xl border p-8 ${f.big ? 'sm:col-span-2 sm:flex sm:items-center sm:gap-10' : ''}`}
              style={{ borderColor: 'rgba(168,130,90,0.25)', backgroundColor: 'var(--color-lp-cream-paper)' }}
            >
              <div className={f.big ? 'sm:flex-1' : ''}>
                <div className="flex items-center gap-3 mb-3">
                  <f.icon className="w-4 h-4" style={{ color: 'var(--color-lp-trail-600)' }} />
                  <span className="font-mono text-[10px] tracking-widest uppercase" style={{ color: 'var(--color-lp-trail-600)' }}>{f.tag}</span>
                </div>
                <h3 className="font-display font-bold text-xl sm:text-2xl" style={{ color: 'var(--color-lp-ink)' }}>{f.title}</h3>
                <p className="mt-3 font-body leading-relaxed max-w-md" style={{ color: 'var(--color-lp-ink-soft)' }}>{f.body}</p>
              </div>
              {f.big && <div className="hidden sm:block shrink-0 w-40 h-40"><FeatureIllustration /></div>}
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

const JOURNEYS = [
  { title: 'Robotics build season', steps: 34, forks: 128, rotate: '-rotate-2', accent: 'var(--color-lp-trail-600)' },
  { title: 'Common App, start to submit', steps: 21, forks: 342, rotate: 'rotate-1', accent: 'var(--color-lp-gold-600)' },
  { title: 'Learn to solo a 12-bar blues', steps: 16, forks: 76, rotate: '-rotate-1', accent: 'var(--color-lp-bark-500)' },
];

function Journeys({ onJump }: { onJump: (id: string) => void }) {
  return (
    <section id="journeys" className="relative py-24 sm:py-32" style={{ backgroundColor: 'var(--color-lp-cream-deep)' }}>
      <div className="mx-auto max-w-6xl px-5 sm:px-8 grid lg:grid-cols-[0.85fr_1.15fr] gap-14 items-center">
        <div>
          <span className="font-mono text-[11px] tracking-widest uppercase" style={{ color: 'var(--color-lp-bark-500)' }}>Public journeys</span>
          <h2 className="mt-4 font-display font-extrabold text-3xl sm:text-4xl leading-tight" style={{ color: 'var(--color-lp-ink)' }}>
            Someone's already walked
            <br className="hidden sm:block" /> a trail like yours.
          </h2>
          <p className="mt-5 font-body leading-relaxed max-w-md" style={{ color: 'var(--color-lp-ink-soft)' }}>
            Browse trails other students built for goals like yours, see exactly how they broke it down, and fork one as a starting point for your own.
          </p>
          <button
            type="button"
            onClick={() => onJump('cta')}
            className="mt-7 inline-flex items-center gap-2 font-body font-semibold border-b-2 pb-1 hover:opacity-70 transition-opacity cursor-pointer"
            style={{ color: 'var(--color-lp-forest-700)', borderColor: 'var(--color-lp-forest-700)' }}
          >
            Browse journeys
          </button>
        </div>

        <div className="flex flex-col gap-5">
          {JOURNEYS.map((j) => (
            <div
              key={j.title}
              className={`rounded-2xl border p-6 shadow-[0_14px_30px_-18px_rgba(27,27,22,0.3)] hover:-translate-y-0.5 transition-transform ${j.rotate}`}
              style={{ borderColor: 'rgba(168,130,90,0.25)', backgroundColor: 'var(--color-lp-cream-paper)' }}
            >
              <span className="inline-block w-2.5 h-2.5 rounded-full" style={{ backgroundColor: j.accent }} />
              <h3 className="mt-3 font-display font-bold text-lg leading-snug" style={{ color: 'var(--color-lp-ink)' }}>{j.title}</h3>
              <div className="mt-4 flex items-center gap-4 font-mono text-[11px]" style={{ color: 'var(--color-lp-ink-faint)' }}>
                <span>{j.steps} nodes</span>
                <span className="w-1 h-1 rounded-full" style={{ backgroundColor: 'var(--color-lp-ink-faint)', opacity: 0.5 }} />
                <span>{j.forks} forks</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

const SPARKLES = [
  { left: '8%', top: '20%', size: 6, duration: 3.2 },
  { left: '18%', top: '55%', size: 4, duration: 4.1 },
  { left: '30%', top: '15%', size: 5, duration: 2.6 },
  { left: '46%', top: '40%', size: 3, duration: 3.8 },
  { left: '62%', top: '22%', size: 5, duration: 3.4 },
  { left: '74%', top: '50%', size: 4, duration: 4.4 },
  { left: '85%', top: '18%', size: 6, duration: 2.9 },
  { left: '93%', top: '45%', size: 3, duration: 3.6 },
  { left: '52%', top: '60%', size: 4, duration: 3.1 },
  { left: '12%', top: '70%', size: 3, duration: 4.6 },
];

function CallToAction({ onSignUp }: { onSignUp: () => void }) {
  return (
    <section id="cta" className="relative overflow-hidden py-28 sm:py-36" style={{ backgroundColor: 'var(--color-lp-forest-950)' }}>
      <div className="absolute inset-0" aria-hidden="true">
        {SPARKLES.map((s, i) => (
          <span
            key={i}
            className="absolute rounded-full animate-pulse"
            style={{
              left: s.left,
              top: s.top,
              width: s.size,
              height: s.size,
              backgroundColor: 'var(--color-lp-gold-400)',
              opacity: 0.7,
              animationDuration: `${s.duration}s`,
              boxShadow: '0 0 8px 2px rgba(223,201,138,0.5)',
            }}
          />
        ))}
      </div>
      <svg className="absolute inset-x-0 bottom-0 w-full h-[120px] sm:h-[160px]" viewBox="0 0 1440 160" preserveAspectRatio="none" aria-hidden="true">
        <path
          d="M0 160 L0 90 L60 40 L100 90 L140 55 L180 90 L220 30 L260 90 L310 60 L350 90 L400 45 L440 90 L500 70 L540 90 L600 35 L650 90 L700 60 L760 90 L820 40 L870 90 L930 65 L980 90 L1040 45 L1090 90 L1150 60 L1200 90 L1260 35 L1310 90 L1370 55 L1440 90 L1440 160 Z"
          fill="var(--color-lp-forest-900)"
        />
      </svg>

      <div className="relative mx-auto max-w-3xl px-5 sm:px-8 text-center">
        <span className="font-mono text-[11px] tracking-widest uppercase" style={{ color: 'var(--color-lp-trail-300)' }}>Ready when you are</span>
        <h2 className="mt-5 font-display font-extrabold text-3xl sm:text-5xl leading-tight" style={{ color: 'var(--color-lp-cream-paper)' }}>Find your trail.</h2>
        <p className="mt-5 font-body text-lg leading-relaxed max-w-xl mx-auto" style={{ color: 'rgba(231,242,227,0.8)' }}>
          Free to start. No mascot, no guilt-trip notifications — just a clear next step, whenever you're ready to take it.
        </p>
        <div className="mt-9 flex flex-wrap items-center justify-center gap-4">
          <button
            type="button"
            onClick={onSignUp}
            className="inline-flex items-center gap-2 rounded-full px-7 py-3.5 font-body font-semibold text-white shadow-[0_3px_0_#173722] hover:-translate-y-0.5 hover:shadow-[0_5px_0_#173722] transition-all cursor-pointer"
            style={{ backgroundColor: 'var(--color-lp-trail-600)' }}
          >
            Start your trail — it's free
          </button>
        </div>
      </div>
    </section>
  );
}

function Footer({ onJump }: { onJump: (id: string) => void }) {
  return (
    <footer className="border-t" style={{ backgroundColor: 'var(--color-lp-forest-950)', borderColor: 'rgba(247,241,225,0.1)' }}>
      <div className="mx-auto max-w-6xl px-5 sm:px-8 py-14">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-10">
          <div>
            <button type="button" onClick={() => onJump('top')} className="flex items-center gap-2.5 cursor-pointer">
              <span className="grid place-items-center w-9 h-9 rounded-lg p-1.5" style={{ backgroundColor: 'rgba(247,241,225,0.1)' }}>
                <img src={strailLogo} alt="Strail" className="w-full h-full object-contain" />
              </span>
              <span className="font-display font-bold text-lg" style={{ color: 'var(--color-lp-cream-paper)' }}>Strail</span>
            </button>
            <p className="mt-3 font-body text-sm max-w-xs" style={{ color: 'rgba(231,242,227,0.6)' }}>
              Stop overwhelm. Turn big goals into small steps.
            </p>
          </div>

          <div className="flex flex-wrap gap-x-12 gap-y-8">
            <div>
              <p className="font-mono text-[11px] tracking-widest uppercase" style={{ color: 'rgba(231,242,227,0.4)' }}>Site</p>
              <ul className="mt-3 space-y-2 font-body text-sm" style={{ color: 'rgba(231,242,227,0.7)' }}>
                {NAV_LINKS.map((l) => (
                  <li key={l.href}>
                    <button type="button" onClick={() => onJump(l.href)} className="hover:opacity-80 transition-opacity cursor-pointer">{l.label}</button>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="font-mono text-[11px] tracking-widest uppercase" style={{ color: 'rgba(231,242,227,0.4)' }}>Legal</p>
              <ul className="mt-3 space-y-2 font-body text-sm" style={{ color: 'rgba(231,242,227,0.7)' }}>
                <li><a href="#" className="hover:opacity-80 transition-opacity">Privacy Policy</a></li>
                <li><a href="#" className="hover:opacity-80 transition-opacity">Terms &amp; Conditions</a></li>
              </ul>
            </div>
            <div>
              <p className="font-mono text-[11px] tracking-widest uppercase" style={{ color: 'rgba(231,242,227,0.4)' }}>Follow</p>
              <ul className="mt-3 space-y-2 font-body text-sm" style={{ color: 'rgba(231,242,227,0.7)' }}>
                <li>
                  <a href="#" className="inline-flex items-center gap-2 hover:opacity-80 transition-opacity">
                    <Instagram className="w-4 h-4" /> Instagram
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-14 pt-6 border-t flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between" style={{ borderColor: 'rgba(247,241,225,0.1)' }}>
          <p className="font-body text-xs" style={{ color: 'rgba(231,242,227,0.4)' }}>© {new Date().getFullYear()} Strail. Made for the ones juggling too much.</p>
        </div>
      </div>
    </footer>
  );
}

export default function LandingPage({ onSignIn, onSignUp, onGuest, isGuestSubmitting }: LandingPageProps) {
  const sectionElsRef = useRef<Record<string, HTMLElement | null>>({});
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const idx = SECTIONS.findIndex((s) => s.id === entry.target.id);
          if (idx !== -1) setActiveIndex(idx);
        });
      },
      { rootMargin: '-35% 0px -55% 0px', threshold: 0 }
    );

    SECTIONS.forEach((s) => {
      const el = document.getElementById(s.id);
      sectionElsRef.current[s.id] = el;
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  const jumpTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="relative font-body overflow-x-hidden" style={{ backgroundColor: 'var(--color-lp-cream)' }}>
      <SideTrailNav activeIndex={activeIndex} onJump={jumpTo} />
      <Header onJump={jumpTo} onSignUp={onSignUp} />
      <main>
        <Hero onSignUp={onSignUp} onSignIn={onSignIn} onGuest={onGuest} isGuestSubmitting={isGuestSubmitting} />
        <ProblemStatement />
        <HowItWorks />
        <Features />
        <Journeys onJump={jumpTo} />
        <CallToAction onSignUp={onSignUp} />
      </main>
      <Footer onJump={jumpTo} />
    </div>
  );
}
